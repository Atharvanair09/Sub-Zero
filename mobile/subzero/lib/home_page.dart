import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'profile_page.dart';
import 'goals_page.dart';
import 'add_transaction_page.dart';
import 'budget_overview_page.dart';
import 'financial_health_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
  double _balance = 23549.34;
  Set<String> _processedTransactionIds = {};
  Timer? _fetchTimer;
  bool _isFirstRun = false;
  List<dynamic> _recentTransactions = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadBalanceData().then((_) {
      _fetchTransactions();
    });
    _fetchTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      _fetchTransactions();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _fetchTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _fetchTransactions();
    }
  }

  String _getBackendUrl() {
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:5000';
      }
    } catch (_) {}
    return 'http://localhost:5000';
  }

  Future<void> _fetchTransactions() async {
    final userId = AuthService.instance.userId ?? '';
    if (userId.isEmpty) return;

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
        List<Map<String, dynamic>> txns = List<Map<String, dynamic>>.from(data);
        
        setState(() {
          _recentTransactions = data;
          _recentTransactions.sort((a, b) {
            final dateA = DateTime.tryParse(a['date'] ?? '') ?? DateTime.now();
            final dateB = DateTime.tryParse(b['date'] ?? '') ?? DateTime.now();
            return dateB.compareTo(dateA);
          });
        });
        
        final prefs = await SharedPreferences.getInstance();
        if (_isFirstRun) {
          for (var tx in txns) {
            String id = tx['_id']?.toString() ?? '';
            if (id.isNotEmpty) _processedTransactionIds.add(id);
          }
          _isFirstRun = false;
          await prefs.setStringList('processed_transaction_ids_v5', _processedTransactionIds.toList());
        } else {
          await processNewTransactions(txns);
        }
      } catch (e) {
        debugPrint('Error parsing transactions: $e');
      }
    }
  }

  Future<void> _loadBalanceData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _balance = prefs.getDouble('current_balance_v5') ?? 23549.34;
      List<String>? processedIds = prefs.getStringList('processed_transaction_ids_v5');
      if (processedIds != null) {
        _processedTransactionIds = processedIds.toSet();
      } else {
        _isFirstRun = true;
      }
    });
  }

  /// Call this method when new transactions are synced.
  /// Example transaction format: {'externalId': 'tx123', 'amount': 500.0, 'type': 'credit'}
  Future<void> processNewTransactions(List<Map<String, dynamic>> newTransactions) async {
    final prefs = await SharedPreferences.getInstance();
    bool balanceChanged = false;

    for (var tx in newTransactions) {
      String id = tx['_id']?.toString() ?? '';
      if (id.isEmpty || _processedTransactionIds.contains(id)) {
        continue;
      }

      double amount = (tx['amount'] as num).toDouble();
      String type = (tx['type'] as String?)?.toLowerCase() ?? 'debit'; // 'credit' or 'debit'

      if (type == 'credit') {
        _balance += amount;
      } else if (type == 'debit') {
        _balance -= amount;
      }

      _processedTransactionIds.add(id);
      balanceChanged = true;
    }

    if (balanceChanged) {
      setState(() {});
      await prefs.setDouble('current_balance_v5', _balance);
      await prefs.setStringList('processed_transaction_ids_v5', _processedTransactionIds.toList());
    }
  }

  String _formatBalance(double balance) {
    String fixed = balance.toStringAsFixed(2);
    List<String> parts = fixed.split('.');
    String formattedInt = parts[0].replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',');
    return '₹$formattedInt.${parts[1]}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text(
          'SUBZERO',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Colors.black),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Builder(builder: (context) {
              final photo = AuthService.instance.photoUrl;
              return GestureDetector(
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ProfilePage()),
                ),
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    border: Border.all(color: Colors.black, width: 2),
                    image: photo != null
                        ? DecorationImage(
                            image: NetworkImage(photo),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: photo == null
                      ? const Icon(Icons.person, size: 18)
                      : null,
                ),
              );
            }),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2.0),
          child: Container(
            color: Colors.black,
            height: 2.0,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Total Balance Card
              _buildNeobrutalistCard(
                color: Colors.white,
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL BALANCE',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _formatBalance(_balance),
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w900,
                        fontSize: 40,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF9AFF00),
                            border: Border.all(color: Colors.black, width: 1.5),
                          ),
                          child: Text(
                            '+12.5% THIS MONTH',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w800,
                              fontSize: 10,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'vs last period',
                          style: GoogleFonts.inter(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Action Buttons Row
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const AddTransactionPage()),
                        );
                      },
                      child: _buildActionButton(
                        icon: Icons.add,
                        label: 'ADD',
                        color: const Color(0xFF9AFF00),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.qr_code_scanner,
                      label: 'SCAN',
                      color: Colors.yellow,
                      textColor: Colors.black,
                      iconColor: Colors.black,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.payments_outlined,
                      label: 'EMAIL',
                      color: Colors.red,
                      textColor: Colors.white,
                      iconColor: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.swap_horiz,
                      label: 'MOVE',
                      color: Colors.black,
                      textColor: Colors.white,
                      iconColor: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // AI Insight Card
              _buildNeobrutalistCard(
                color: const Color(0xFF9AFF00),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          color: Colors.black,
                          child: Text(
                            'AI INSIGHT',
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 10,
                            ),
                          ),
                        ),
                        const Icon(Icons.auto_awesome, size: 20),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Unusual spending\nin 'Dining'\ndetected.",
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w900,
                        fontSize: 28,
                        height: 1.1,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Your weekend spending is 40%\nhigher than your 3-month average.\nConsider setting a cap for\n'Entertainment' this week.",
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Mock Bar Chart
                    SizedBox(
                      height: 80,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildBar(30, Colors.black),
                          _buildBar(40, Colors.black),
                          _buildBar(25, Colors.black),
                          _buildBar(70, Colors.black, topColor: Colors.red),
                          _buildBar(80, Colors.black, topColor: Colors.red),
                          _buildBar(50, Colors.black),
                          _buildBar(35, Colors.black),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Recent Activity',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w900,
                      fontSize: 24,
                      letterSpacing: -0.5,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const GoalsPage()),
                      );
                    },
                    child: Text(
                      'VIEW ALL',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.black, thickness: 2),
              const SizedBox(height: 16),
              if (_recentTransactions.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      'NO RECENT TRANSACTIONS',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w800),
                    ),
                  ),
                )
              else
                ..._recentTransactions.take(5).map((t) {
                  final String title = t['name'] ?? 'TRANSACTION';
                  final double amountVal = (t['amount'] ?? 0).toDouble();
                  final String type = (t['type'] ?? 'debit').toString().toLowerCase();
                  final bool isCredit = type == 'credit';
                  final String sign = isCredit ? '+' : '-';
                  
                  final Color iconColor = isCredit ? const Color(0xFF9AFF00) : const Color(0xFFFF4C4C);
                  final Color amountColor = isCredit ? const Color(0xFF3B8000) : Colors.black;
                  final IconData icon = _getIconForCategory(t['category'] ?? '');
                  
                  final String categoryStr = (t['category'] ?? 'UNKNOWN').toString().toUpperCase();
                  final String dateStr = t['date'] ?? '';
                  final parsedDate = DateTime.tryParse(dateStr) ?? DateTime.now();
                  final String header = _formatDateHeader(parsedDate);
                  final String subtitle = '$categoryStr • $header';

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
                    child: _buildTransactionCard(
                      icon: icon,
                      title: title,
                      subtitle: subtitle,
                      amount: '$sign\$$amountVal',
                      iconColor: iconColor,
                      amountColor: amountColor,
                    ),
                  );
                }),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNeobrutalistCard({
    required Widget child,
    required Color color,
    required EdgeInsets padding,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: Colors.black, width: 2.5),
        boxShadow: const [
          BoxShadow(
            color: Colors.black,
            offset: Offset(6, 6),
          ),
        ],
      ),
      padding: padding,
      child: child,
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    Color textColor = Colors.black,
    Color iconColor = Colors.black,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: Colors.black, width: 2),
        boxShadow: const [
          BoxShadow(
            color: Colors.black,
            offset: Offset(4, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        children: [
          Icon(icon, color: iconColor),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              color: textColor,
              fontWeight: FontWeight.w900,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBar(double height, Color color, {Color? topColor}) {
    return Container(
      width: 24,
      height: height,
      color: color,
      child: topColor != null
          ? Column(
              children: [
                Container(height: 4, color: topColor),
              ],
            )
          : null,
    );
  }

  IconData _getIconForCategory(String category) {
    switch (category.toLowerCase()) {
      case 'food':
      case 'dining':
        return Icons.restaurant;
      case 'transport':
      case 'travel':
        return Icons.directions_car;
      case 'shopping':
        return Icons.shopping_bag;
      case 'bills':
        return Icons.receipt;
      case 'entertainment':
      case 'ott':
      case 'streaming':
      case 'music':
        return Icons.sports_esports;
      case 'bank transaction':
        return Icons.account_balance;
      default:
        return Icons.payment;
    }
  }

  String _formatDateHeader(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final transactionDate = DateTime(date.year, date.month, date.day);
    
    if (transactionDate == today) {
      return 'TODAY';
    } else if (transactionDate == yesterday) {
      return 'YESTERDAY';
    } else {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return '${months[date.month - 1]} ${date.day.toString().padLeft(2, '0')}';
    }
  }

  Widget _buildTransactionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required String amount,
    required Color iconColor,
    Color amountColor = Colors.black,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
        boxShadow: const [
          BoxShadow(
            color: Colors.black,
            offset: Offset(4, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor,
              border: Border.all(color: Colors.black, width: 1.5),
            ),
            child: Icon(icon, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 10,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w900,
              fontSize: 18,
              color: amountColor,
            ),
          ),
        ],
      ),
    );
  }

}
