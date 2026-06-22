import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AddTransactionPage extends StatefulWidget {
  const AddTransactionPage({super.key});

  @override
  State<AddTransactionPage> createState() => _AddTransactionPageState();
}

class _AddTransactionPageState extends State<AddTransactionPage> {
  bool isExpense = true;
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  String? selectedCategory;
  DateTime selectedDate = DateTime.now();
  String? errorText;

  final List<String> expenseCategories = [
    'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment'
  ];
  final List<String> incomeCategories = [
    'Salary', 'Transfer', 'Refund', 'Other'
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submitTransaction() {
    setState(() {
      errorText = null;
    });

    final amountText = _amountController.text.replaceAll(',', '');
    final amount = double.tryParse(amountText);

    if (amount == null || amount <= 0) {
      setState(() {
        errorText = 'ENTER A VALID AMOUNT';
      });
      _showErrorSnackBar('ENTER A VALID AMOUNT');
      return;
    }

    if (selectedCategory == null) {
      setState(() {
        errorText = 'SELECT A CATEGORY FIRST';
      });
      _showErrorSnackBar('SELECT A CATEGORY FIRST');
      return;
    }

    // Success! Pop and show snackbar
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'TRANSACTION ADDED',
          style: GoogleFonts.inter(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 14,
          ),
        ),
        backgroundColor: Colors.black,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black, width: 2),
          borderRadius: BorderRadius.zero,
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.inter(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 14,
          ),
        ),
        backgroundColor: const Color(0xFFE50000),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black, width: 2),
          borderRadius: BorderRadius.zero,
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
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
    if (picked != null && picked != selectedDate) {
      setState(() {
        selectedDate = picked;
      });
    }
  }

  Widget _buildToggle() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              setState(() {
                isExpense = true;
                selectedCategory = null;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: isExpense ? const Color(0xFFE50000) : Colors.white,
                border: Border.all(color: Colors.black, width: 2),
                boxShadow: isExpense
                    ? const [BoxShadow(color: Colors.black, offset: Offset(4, 4))]
                    : [],
              ),
              child: Center(
                child: Text(
                  'EXPENSE',
                  style: GoogleFonts.inter(
                    color: isExpense ? Colors.white : Colors.black,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GestureDetector(
            onTap: () {
              setState(() {
                isExpense = false;
                selectedCategory = null;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: !isExpense ? const Color(0xFF3B8000) : Colors.white,
                border: Border.all(color: Colors.black, width: 2),
                boxShadow: !isExpense
                    ? const [BoxShadow(color: Colors.black, offset: Offset(4, 4))]
                    : [],
              ),
              child: Center(
                child: Text(
                  'INCOME',
                  style: GoogleFonts.inter(
                    color: !isExpense ? Colors.white : Colors.black,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryGrid() {
    final categories = isExpense ? expenseCategories : incomeCategories;
    final isCategoryError = errorText == 'SELECT A CATEGORY FIRST';

    return Container(
      decoration: BoxDecoration(
        border: isCategoryError ? Border.all(color: const Color(0xFFE50000), width: 2) : null,
      ),
      padding: isCategoryError ? const EdgeInsets.all(8) : EdgeInsets.zero,
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        children: categories.map((cat) {
          final isSelected = selectedCategory == cat;
          return GestureDetector(
            onTap: () {
              setState(() {
                selectedCategory = cat;
                errorText = null;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? (isExpense ? const Color(0xFFFFD6D6) : const Color(0xFFD6FFD6)) : Colors.white,
                border: Border.all(color: Colors.black, width: 2),
                boxShadow: isSelected
                    ? const [BoxShadow(color: Colors.black, offset: Offset(3, 3))]
                    : const [BoxShadow(color: Colors.black, offset: Offset(2, 2))],
              ),
              child: Text(
                cat.toUpperCase(),
                style: GoogleFonts.inter(
                  color: Colors.black,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
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
          'ADD TRANSACTION',
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
                  _buildToggle(),
                  const SizedBox(height: 32),
                  // Amount Field
                  Text(
                    'AMOUNT',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.black, width: 3),
                      boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          isExpense ? '-₹' : '+₹',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w900,
                            fontSize: 48,
                            color: isExpense ? const Color(0xFFB00000) : const Color(0xFF3B8000),
                            letterSpacing: -2,
                          ),
                        ),
                        Expanded(
                          child: TextField(
                            controller: _amountController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            autofocus: true,
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w900,
                              fontSize: 48,
                              color: Colors.black,
                              letterSpacing: -1,
                            ),
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: '0.00',
                              hintStyle: GoogleFonts.inter(
                                fontWeight: FontWeight.w900,
                                fontSize: 48,
                                color: Colors.grey[400],
                                letterSpacing: -1,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Categories
                  Text(
                    'CATEGORY',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildCategoryGrid(),
                  const SizedBox(height: 32),
                  // Date Selection
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'DATE',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w800,
                                fontSize: 12,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 8),
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
                                      "${selectedDate.toLocal()}".split(' ')[0],
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14,
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
                      const SizedBox(width: 16),
                      // Receipt Attachment
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'RECEIPT',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w800,
                                fontSize: 12,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Attach Receipt opened!', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
                                    backgroundColor: Colors.black,
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFF0D4),
                                  border: Border.all(color: Colors.black, width: 2),
                                  boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.camera_alt_outlined, size: 18),
                                    const SizedBox(width: 8),
                                    Text(
                                      'ATTACH',
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  // Notes
                  Text(
                    'NOTES (OPTIONAL)',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.black, width: 2),
                      boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                    ),
                    child: TextField(
                      controller: _notesController,
                      maxLines: 2,
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                      ),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.all(16),
                        hintText: 'Add a note...',
                        hintStyle: GoogleFonts.inter(
                          color: Colors.grey[500],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 48), // Padding for scroll
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
            child: GestureDetector(
              onTap: _submitTransaction,
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
                    'CONFIRM TRANSACTION',
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
        ],
      ),
    );
  }
}
