import 'dart:convert';
import 'dart:io' show Platform;
import 'dart:math';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class GoalsPage extends StatefulWidget {
  const GoalsPage({super.key});

  @override
  State<GoalsPage> createState() => _GoalsPageState();
}

class _GoalsPageState extends State<GoalsPage> {
  List<dynamic> _transactions = [];
  bool _isLoading = true;
  bool _isSyncing = false;
  String _selectedFilter = 'ALL';

  final List<Color> _cardColors = const [
    Color(0xFF2954FF), // Blue
    Color(0xFF9AFF00), // Green
    Color(0xFFFFDE43), // Yellow
    Color(0xFFB0B0B0), // Gray
  ];

  @override
  void initState() {
    super.initState();
    _fetchTransactions();
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

  Future<http.Response> _apiCall(String path, {String method = 'GET'}) async {
    final localUrl = '${_getBackendUrl()}$path';
    try {
      if (method == 'POST') {
        return await http.post(Uri.parse(localUrl)).timeout(const Duration(seconds: 4));
      } else {
        return await http.get(Uri.parse(localUrl)).timeout(const Duration(seconds: 4));
      }
    } catch (_) {}

    final prodUrl = 'https://sub-zero-50le.onrender.com$path';
    if (method == 'POST') {
      return await http.post(Uri.parse(prodUrl));
    } else {
      return await http.get(Uri.parse(prodUrl));
    }
  }

  Future<void> _fetchTransactions() async {
    setState(() => _isLoading = true);
    final userId = AuthService.instance.userId ?? '';
    if (userId.isEmpty) {
      if (!mounted) return;
      setState(() {
        _transactions = [];
        _isLoading = false;
      });
      return;
    }

    try {
      final response = await _apiCall('/api/transactions?userId=$userId');
      if (!mounted) return;
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _transactions = data;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load transactions');
      }
    } catch (e) {
      debugPrint('Error fetching transactions: $e');
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _syncEmails() async {
    setState(() => _isSyncing = true);
    final userId = AuthService.instance.userId ?? '';
    if (userId.isEmpty) {
      if (!mounted) return;
      setState(() => _isSyncing = false);
      return;
    }

    try {
      final response = await _apiCall('/api/gmail/scan?userId=$userId&autoSave=true');
      if (!mounted) return;
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('EMAIL SYNC COMPLETED SUCCESSFULLY')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('NO NEW TRANSACTIONS FOUND')),
          );
        }
      } else if (response.statusCode == 401) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('GOOGLE AUTH EXPIRED. PLEASE RE-AUTHENTICATE ON WEB.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('FAILED TO SYNC GMAIL TRANSACTION ALERTS')),
        );
      }
    } catch (e) {
      debugPrint('Error syncing emails: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SYNC ERROR. SERVER MIGHT BE UNREACHABLE.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSyncing = false);
        _fetchTransactions();
      }
    }
  }

  Color _getTransactionColor(String id) {
    final int seed = id.hashCode;
    final Random random = Random(seed);
    return _cardColors[random.nextInt(_cardColors.length)];
  }

  Color _getTitleColor(Color background) {
    if (background == const Color(0xFF2954FF)) {
      return Colors.white;
    }
    return Colors.black;
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

  Map<String, List<dynamic>> _groupTransactions(List<dynamic> txns) {
    final filtered = txns.where((t) {
      final category = (t['category'] ?? '').toString().toLowerCase();
      if (_selectedFilter == 'ALL') return true;
      if (_selectedFilter == 'TECH') {
        return ['entertainment', 'ott', 'streaming', 'music', 'tech', 'work'].contains(category);
      }
      if (_selectedFilter == 'FOOD') {
        return ['food', 'dining'].contains(category);
      }
      if (_selectedFilter == 'LIFE') {
        return ['life', 'bills', 'transport', 'shopping', 'bank transaction', 'general'].contains(category);
      }
      return true;
    }).toList();

    filtered.sort((a, b) {
      final dateA = DateTime.tryParse(a['date'] ?? '') ?? DateTime.now();
      final dateB = DateTime.tryParse(b['date'] ?? '') ?? DateTime.now();
      return dateB.compareTo(dateA);
    });

    final Map<String, List<dynamic>> groups = {};
    for (var t in filtered) {
      final dateStr = t['date'] ?? '';
      final parsedDate = DateTime.tryParse(dateStr) ?? DateTime.now();
      final header = _formatDateHeader(parsedDate);
      groups.putIfAbsent(header, () => []).add(t);
    }
    return groups;
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

  @override
  Widget build(BuildContext context) {
    final groupedTxns = _groupTransactions(_transactions);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Text(
          'Transaction',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 28,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: _isSyncing 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                  )
                : const Icon(Icons.sync, color: Colors.black),
            onPressed: _isSyncing ? null : _syncEmails,
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
      body: RefreshIndicator(
        color: Colors.black,
        onRefresh: _syncEmails,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Weekly Flow Card
                _buildNeobrutalistCard(
                  color: const Color(0xFFF4F4F4),
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'WEEKLY\nFLOW',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w900,
                              fontSize: 24,
                              height: 1.1,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            '\$4,290.00',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w900,
                              fontSize: 20,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      // Bar Chart
                      SizedBox(
                        height: 160,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildChartColumn('MON', 40, const Color(0xFF2954FF)),
                            _buildChartColumn('TUE', 80, const Color(0xFF9AFF00)),
                            _buildChartColumn('WED', 30, const Color(0xFFB00000)),
                            _buildChartColumn('THU', 100, const Color(0xFF2954FF)),
                            _buildChartColumn('FRI', 60, const Color(0xFF9AFF00)),
                            _buildChartColumn('SAT', 70, Colors.black),
                            _buildChartColumn('SUN', 90, const Color(0xFFE5E5FF)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Filter Buttons
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildFilterButton('ALL'),
                    _buildFilterButton('TECH'),
                    _buildFilterButton('FOOD'),
                    _buildFilterButton('LIFE'),
                  ],
                ),
                const SizedBox(height: 32),
                
                if (_isLoading)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 60.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const CircularProgressIndicator(
                            color: Colors.black,
                            strokeWidth: 4.0,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'LOADING TRANSACTIONS HISTORY...',
                            style: GoogleFonts.inter(
                              color: Colors.black,
                              fontWeight: FontWeight.w900,
                              fontSize: 14,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else if (groupedTxns.isEmpty)
                  _buildNeobrutalistCard(
                    color: Colors.white,
                    padding: const EdgeInsets.all(24),
                    child: Center(
                      child: Text(
                        'NO TRANSACTIONS FOUND',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ),
                  )
                else
                  ...groupedTxns.entries.expand((entry) {
                    final String dateHeader = entry.key;
                    final List<dynamic> txns = entry.value;
                    
                    return [
                      Text(
                        dateHeader,
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: txns.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final t = txns[index];
                          final id = t['_id'] ?? index.toString();
                          final String title = t['name'] ?? 'TRANSACTION';
                          final double amountVal = (t['amount'] ?? 0).toDouble();
                          
                          final String type = (t['type'] ?? 'debit').toString().toLowerCase();
                          final bool isCredit = type == 'credit';
                          final String sign = isCredit ? '+' : '-';
                          
                          final Color bgColor = _getTransactionColor(id);
                          final Color titleColor = _getTitleColor(bgColor);
                          final Color amountColor = isCredit ? const Color(0xFF3B8000) : const Color(0xFFFF3B30);
                          final IconData icon = _getIconForCategory(t['category'] ?? '');
                          
                          return _buildTransactionCard(
                            icon: icon,
                            title: title,
                            amount: '$sign\$$amountVal',
                            backgroundColor: bgColor,
                            titleColor: titleColor,
                            amountColor: amountColor,
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                    ];
                  }),
              ],
            ),
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

  Widget _buildChartColumn(String label, double height, Color color) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Container(
          width: 28,
          height: height,
          decoration: BoxDecoration(
            color: color,
            border: Border.all(color: Colors.black, width: 1.5),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w800,
            fontSize: 10,
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterButton(String label) {
    final bool isSelected = _selectedFilter == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = label;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? Colors.black : Colors.white,
          border: Border.all(color: Colors.black, width: 2),
          boxShadow: const [
            BoxShadow(
              color: Colors.black,
              offset: Offset(3, 3),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: isSelected ? Colors.white : Colors.black,
            fontWeight: FontWeight.w800,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionCard({
    required IconData icon,
    required String title,
    required String amount,
    required Color backgroundColor,
    required Color titleColor,
    required Color amountColor,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        border: Border.all(color: Colors.black, width: 2.5),
        boxShadow: const [
          BoxShadow(
            color: Colors.black,
            offset: Offset(4, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.black, width: 1.5),
            ),
            child: Icon(icon, color: Colors.black, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              title.toUpperCase(),
              style: GoogleFonts.inter(
                color: titleColor,
                fontWeight: FontWeight.w900,
                fontSize: 16,
                letterSpacing: -0.5,
              ),
            ),
          ),
          Text(
            amount,
            style: GoogleFonts.inter(
              color: amountColor,
              fontWeight: FontWeight.w900,
              fontSize: 18,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}

