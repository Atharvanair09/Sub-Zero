import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'cashflow_models.dart';

class BudgetsPage extends StatefulWidget {
  final bool isTab;
  const BudgetsPage({super.key, this.isTab = false});

  @override
  State<BudgetsPage> createState() => _BudgetsPageState();
}

class _BudgetsPageState extends State<BudgetsPage> {
  List<BudgetUtilization> _utilizations = [];
  bool _isLoading = true;
  double _totalBudget = 0;
  double _totalSpent = 0;

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  String _getBackendUrl() {
    if (kIsWeb) return 'http://localhost:5000';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:5000';
    } catch (_) {}
    return 'http://localhost:5000';
  }

  Future<void> _fetchSummary() async {
    setState(() => _isLoading = true);
    final userId = AuthService.instance.userId ?? '';
    if (userId.isEmpty) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('${_getBackendUrl()}/api/cashflow/summary?userId=$userId')
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final utils = (data['budgetUtilization'] as List).map((u) => BudgetUtilization.fromJson(u)).toList();
        
        double totalB = 0;
        double totalS = 0;
        for (var u in utils) {
          totalB += u.limit;
          totalS += u.spent;
        }

        setState(() {
          _utilizations = utils;
          _totalBudget = totalB;
          _totalSpent = totalS;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load budgets');
      }
    } catch (e) {
      debugPrint('Error: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _editBudget(String category, double currentLimit) async {
    final TextEditingController controller = TextEditingController(text: currentLimit.toString());
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0), side: const BorderSide(color: Colors.black, width: 2)),
        title: Text('EDIT BUDGET: $category', style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            border: OutlineInputBorder(borderSide: BorderSide(color: Colors.black, width: 2)),
            labelText: 'Monthly Limit (\$)',
          ),
          style: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('CANCEL', style: GoogleFonts.inter(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFC6FF00), foregroundColor: Colors.black),
            onPressed: () => Navigator.pop(context, controller.text),
            child: Text('SAVE', style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );

    if (result != null && result.isNotEmpty) {
      final newLimit = double.tryParse(result);
      if (newLimit != null) {
        await _saveBudget(category, newLimit);
      }
    }
  }

  Future<void> _saveBudget(String category, double limit) async {
    final userId = AuthService.instance.userId ?? '';
    try {
      await http.post(
        Uri.parse('${_getBackendUrl()}/api/cashflow/budgets'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'category': category,
          'monthlyLimit': limit,
          'thresholds': [80, 100],
        }),
      ).timeout(const Duration(seconds: 4));
      _fetchSummary();
    } catch (e) {
      debugPrint('Error saving budget: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: widget.isTab ? null : AppBar(
        backgroundColor: const Color(0xFFF3F4F6),
        elevation: 0,
        title: Text(
          'BUDGETS',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 28,
            letterSpacing: -0.5,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: Container(color: Colors.black, height: 2),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.black))
          : RefreshIndicator(
              onRefresh: _fetchSummary,
              color: Colors.black,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Overview Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        border: Border.all(color: Colors.black, width: 2),
                        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TOTAL SPENT / BUDGET', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('\$${_totalSpent.toStringAsFixed(0)}', style: GoogleFonts.inter(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                              Padding(
                                padding: const EdgeInsets.only(bottom: 6, left: 8),
                                child: Text('/ \$${_totalBudget.toStringAsFixed(0)}', style: GoogleFonts.inter(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _buildProgressBar(_totalBudget > 0 ? (_totalSpent / _totalBudget) : 0),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    Text('CATEGORY BUDGETS', style: GoogleFonts.inter(color: Colors.black, fontSize: 20, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 16),
                    
                    if (_utilizations.isEmpty)
                      Center(child: Text('No budgets defined yet. Click "Manage" to add.', style: GoogleFonts.inter(fontWeight: FontWeight.bold)))
                    else
                      ..._utilizations.map((u) => _buildBudgetCard(u)),
                      
                    const SizedBox(height: 24),
                    // Add new category button
                    GestureDetector(
                      onTap: () {
                        // Hardcode categories for demo
                        const cats = ['Food & Dining', 'Shopping', 'Transport', 'Entertainment'];
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            backgroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0), side: const BorderSide(color: Colors.black, width: 2)),
                            title: Text('NEW BUDGET', style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: cats.map((c) => ListTile(
                                title: Text(c, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
                                onTap: () {
                                  Navigator.pop(context);
                                  _editBudget(c, 0);
                                },
                              )).toList(),
                            ),
                          ),
                        );
                      },
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                          color: const Color(0xFFC6FF00),
                          border: Border.all(color: Colors.black, width: 3),
                          boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                        ),
                        child: Center(
                          child: Text(
                            'ADD CATEGORY BUDGET',
                            style: GoogleFonts.inter(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildBudgetCard(BudgetUtilization util) {
    bool isOver = util.spent > util.limit;
    Color barColor = isOver ? const Color(0xFFFF4C4C) : (util.percentage > 80 ? const Color(0xFFFFDE43) : const Color(0xFF9AFF00));
    
    return GestureDetector(
      onTap: () => _editBudget(util.category, util.limit),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.black, width: 2),
          boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(util.category.toUpperCase(), style: GoogleFonts.inter(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w900)),
                const Icon(Icons.edit, size: 16),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('\$${util.spent.toStringAsFixed(0)} SPENT', style: GoogleFonts.inter(color: isOver ? Colors.red : Colors.black, fontSize: 14, fontWeight: FontWeight.bold)),
                Text('\$${util.limit.toStringAsFixed(0)} LIMIT', style: GoogleFonts.inter(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            _buildProgressBar(util.limit > 0 ? (util.spent / util.limit) : 0, color: barColor),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar(double ratio, {Color color = const Color(0xFFC6FF00)}) {
    if (ratio > 1.0) ratio = 1.0;
    return Container(
      height: 12,
      decoration: BoxDecoration(
        color: Colors.grey.shade300,
        border: Border.all(color: Colors.black, width: 1.5),
      ),
      child: Row(
        children: [
          Expanded(
            flex: (ratio * 100).toInt(),
            child: Container(
              decoration: BoxDecoration(
                color: color,
                border: const Border(right: BorderSide(color: Colors.black, width: 1.5)),
              ),
            ),
          ),
          Expanded(
            flex: 100 - (ratio * 100).toInt(),
            child: Container(),
          ),
        ],
      ),
    );
  }
}
