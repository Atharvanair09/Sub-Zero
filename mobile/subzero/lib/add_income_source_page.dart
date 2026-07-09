import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'income_models.dart';
import 'income_service.dart';

class AddIncomeSourcePage extends StatefulWidget {
  final IncomeSource? existingSource;

  const AddIncomeSourcePage({super.key, this.existingSource});

  @override
  State<AddIncomeSourcePage> createState() => _AddIncomeSourcePageState();
}

class _AddIncomeSourcePageState extends State<AddIncomeSourcePage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _senderController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  
  String _frequency = 'Monthly';
  final List<String> _frequencies = ['Weekly', 'Monthly', 'Custom'];
  DateTime? _expectedDate;

  List<String> _creditSenders = [];
  bool _isLoadingSenders = true;

  @override
  void initState() {
    super.initState();
    if (widget.existingSource != null) {
      _nameController.text = widget.existingSource!.name;
      _senderController.text = widget.existingSource!.sender;
      _amountController.text = widget.existingSource!.expectedAmount.toString();
      _frequency = widget.existingSource!.frequency;
      _expectedDate = widget.existingSource!.nextExpectedDate;
    }
    _fetchCreditSenders();
  }

  String _getBackendUrl() {
    if (kIsWeb) return 'http://localhost:5000';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:5000';
    } catch (_) {}
    return 'http://localhost:5000';
  }

  Future<void> _fetchCreditSenders() async {
    final userId = AuthService.instance.userId ?? '';
    if (userId.isEmpty) {
      if (mounted) setState(() => _isLoadingSenders = false);
      return;
    }

    final path = '/api/transactions?userId=$userId';
    final localUrl = '${_getBackendUrl()}$path';
    http.Response? response;

    try {
      response = await http.get(Uri.parse(localUrl)).timeout(const Duration(seconds: 4));
    } catch (_) {
      try {
        final prodUrl = 'https://sub-zero-50le.onrender.com$path';
        response = await http.get(Uri.parse(prodUrl));
      } catch (_) {}
    }

    if (response != null && response.statusCode == 200) {
      try {
        final List<dynamic> data = jsonDecode(response.body);
        final Set<String> senders = {};
        for (var tx in data) {
          if (tx['type'] == 'credit' && tx['name'] != null) {
            final name = tx['name'].toString().trim();
            if (name.isNotEmpty) senders.add(name);
          }
        }
        if (mounted) {
          setState(() {
            _creditSenders = senders.toList();
            if (_senderController.text.isEmpty && _creditSenders.isNotEmpty) {
              _senderController.text = _creditSenders.first;
            }
            _isLoadingSenders = false;
          });
        }
      } catch (e) {
        if (mounted) setState(() => _isLoadingSenders = false);
      }
    } else {
      if (mounted) setState(() => _isLoadingSenders = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _senderController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _saveIncomeSource() async {
    FocusScope.of(context).unfocus();

    final name = _nameController.text.trim();
    final sender = _senderController.text.trim();
    final amountText = _amountController.text.replaceAll(',', '');
    final amount = double.tryParse(amountText);

    if (name.isEmpty || sender.isEmpty || amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'PLEASE FILL ALL REQUIRED FIELDS CORRECTLY',
            style: GoogleFonts.inter(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 14,
            ),
          ),
          backgroundColor: const Color(0xFFE50000),
          behavior: SnackBarBehavior.floating,
          shape: const RoundedRectangleBorder(
            side: BorderSide(color: Colors.black, width: 2),
            borderRadius: BorderRadius.zero,
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
      return;
    }

    final newSource = IncomeSource(
      id: widget.existingSource?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      sender: sender,
      expectedAmount: amount,
      frequency: _frequency.toLowerCase(),
      nextExpectedDate: _expectedDate,
      lastReceivedDate: widget.existingSource?.lastReceivedDate,
      linkedTransactionIds: widget.existingSource?.linkedTransactionIds ?? [],
      isActive: widget.existingSource?.isActive ?? true,
    );

    try {
      if (widget.existingSource != null) {
        await IncomeService.instance.updateIncomeSource(newSource);
      } else {
        await IncomeService.instance.addIncomeSource(newSource);
      }

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.existingSource != null ? 'INCOME SOURCE UPDATED' : 'INCOME SOURCE ADDED',
              style: GoogleFonts.inter(
                color: Colors.black,
                fontWeight: FontWeight.w900,
                fontSize: 14,
              ),
            ),
            backgroundColor: const Color(0xFF9AFF00),
            behavior: SnackBarBehavior.floating,
            shape: const RoundedRectangleBorder(
              side: BorderSide(color: Colors.black, width: 2),
              borderRadius: BorderRadius.zero,
            ),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'ERROR SAVING: ${e.toString().replaceAll('Exception: ', '')}',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 14,
              ),
            ),
            backgroundColor: const Color(0xFFE50000),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _expectedDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Colors.black,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black,
            ),
            dialogTheme: const DialogThemeData(
              shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.black, width: 2),
                borderRadius: BorderRadius.zero,
              ),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _expectedDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black, size: 28),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.existingSource != null ? 'EDIT SOURCE' : 'ADD INCOME SOURCE',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 18,
            letterSpacing: -0.5,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2.0),
          child: Container(color: Colors.black, height: 2.0),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildLabel('SOURCE NAME'),
                  _buildTextField(_nameController, 'e.g., Salary, Pocket Money'),
                  const SizedBox(height: 24),
                  
                  _buildLabel('SENDER (Exact match for auto-detect)'),
                  _buildSenderDropdown(),
                  const SizedBox(height: 24),

                  _buildLabel('EXPECTED AMOUNT (Exact match)'),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.black, width: 3),
                      boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: [
                        Text(
                          '+₹',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w900,
                            fontSize: 32,
                            color: const Color(0xFF3B8000),
                            letterSpacing: -1,
                          ),
                        ),
                        Expanded(
                          child: TextField(
                            controller: _amountController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w900,
                              fontSize: 32,
                              color: Colors.black,
                            ),
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: '0.00',
                              hintStyle: GoogleFonts.inter(
                                fontWeight: FontWeight.w900,
                                fontSize: 32,
                                color: Colors.grey[400],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLabel('FREQUENCY'),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: Colors.black, width: 2),
                                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _frequency,
                                  isExpanded: true,
                                  icon: const Icon(Icons.keyboard_arrow_down, color: Colors.black),
                                  style: GoogleFonts.inter(
                                    color: Colors.black,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                  ),
                                  onChanged: (String? newValue) {
                                    if (newValue != null) {
                                      setState(() {
                                        _frequency = newValue;
                                      });
                                    }
                                  },
                                  items: _frequencies.map<DropdownMenuItem<String>>((String value) {
                                    return DropdownMenuItem<String>(
                                      value: value,
                                      child: Text(value.toUpperCase()),
                                    );
                                  }).toList(),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLabel('NEXT EXPECTED DATE (OPTIONAL)'),
                            GestureDetector(
                              onTap: _selectDate,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  border: Border.all(color: Colors.black, width: 2),
                                  boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      _expectedDate != null
                                          ? "${_expectedDate!.toLocal()}".split(' ')[0]
                                          : 'SELECT DATE',
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const Icon(Icons.calendar_today, size: 18),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          // Submit Button
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.black, width: 2)),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: _saveIncomeSource,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF9AFF00),
                    border: Border.all(color: Colors.black, width: 3),
                    boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
                  ),
                  child: Center(
                    child: Text(
                      'SAVE INCOME SOURCE',
                      style: GoogleFonts.inter(
                        color: Colors.black,
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontWeight: FontWeight.w800,
          fontSize: 12,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: TextField(
        controller: controller,
        style: GoogleFonts.inter(
          fontWeight: FontWeight.w800,
          fontSize: 14,
        ),
        decoration: InputDecoration(
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(16),
          hintText: hint,
          hintStyle: GoogleFonts.inter(
            color: Colors.grey[500],
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildSenderDropdown() {
    if (_isLoadingSenders) {
      return const Padding(
        padding: EdgeInsets.all(8.0),
        child: Center(child: CircularProgressIndicator(color: Colors.black)),
      );
    }
    
    if (_creditSenders.isEmpty) {
      return _buildTextField(_senderController, 'e.g., Acme Corp');
    }

    if (_senderController.text.isNotEmpty && !_creditSenders.contains(_senderController.text)) {
      _creditSenders.add(_senderController.text);
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _senderController.text.isNotEmpty ? _senderController.text : _creditSenders.first,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down, color: Colors.black),
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w800,
            fontSize: 14,
          ),
          onChanged: (String? newValue) {
            if (newValue != null) {
              setState(() {
                _senderController.text = newValue;
              });
            }
          },
          items: _creditSenders.map<DropdownMenuItem<String>>((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
        ),
      ),
    );
  }
}
