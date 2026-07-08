import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;
import 'dart:math';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';
import 'package:fl_chart/fl_chart.dart';
import 'auth_service.dart';

class GoalsPage extends StatefulWidget {
  const GoalsPage({super.key});

  @override
  State<GoalsPage> createState() => _GoalsPageState();
}

class _GoalsPageState extends State<GoalsPage> with WidgetsBindingObserver {
  List<dynamic> _transactions = [];
  bool _isLoading = true;
  bool _isSyncing = false;
  bool _isHistoricalSyncing = false;
  String _selectedCategory = 'All';
  bool _showAllTransactions = false;
  String? _syncStatusMessage;
  Timer? _syncTimer;
  int _currentGraphIndex = 0;
  final PageController _graphPageController = PageController();
  int _touchedPieIndex = -1;

  final List<Color> _cardColors = const [
    Color(0xFF2954FF), // Blue
    Color(0xFF9AFF00), // Green
    Color(0xFFFFDE43), // Yellow
    Color(0xFFB0B0B0), // Gray
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _fetchTransactions();
    _syncTimer = Timer.periodic(const Duration(seconds: 150), (timer) {
      _syncEmails(silent: true);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _syncTimer?.cancel();
    _graphPageController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _syncEmails(silent: true);
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

  Future<void> _syncEmails({bool silent = false, int limit = 50}) async {
    if (!silent) {
      if (limit > 50) {
        setState(() => _isHistoricalSyncing = true);
      } else {
        setState(() => _isSyncing = true);
      }
    }
    final userId = AuthService.instance.userId ?? '';
    if (userId.isEmpty) {
      if (!mounted) return;
      if (!silent) {
        if (limit > 50) setState(() => _isHistoricalSyncing = false);
        else setState(() => _isSyncing = false);
      }
      return;
    }

    try {
      String accessTokenQuery = '';
      if (AuthService.instance.gmailConnected) {
        final GoogleSignIn googleSignIn = GoogleSignIn(
          scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        );
        final account = await googleSignIn.signInSilently();
        if (account != null) {
          final auth = await account.authentication;
          if (auth.accessToken != null) {
            accessTokenQuery = '&accessToken=${auth.accessToken}';
          }
        }
      }

      final response = await _apiCall('/api/gmail/scan?userId=$userId&autoSave=true&limit=$limit$accessTokenQuery');
      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (!silent) {
          if (data['skipped'] == true) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('GMAIL NOT CONNECTED. OPEN THE WEB APP TO LINK YOUR ACCOUNT.'),
                duration: Duration(seconds: 4),
              ),
            );
          } else if (data['success'] == true) {
            setState(() {
              _syncStatusMessage = 'EMAIL SYNCED SUCCESSFULLY';
            });
            await Future.delayed(const Duration(seconds: 2));
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('NO NEW TRANSACTIONS FOUND')),
            );
          }
        }
      } else if (response.statusCode == 401) {
        // Token expired — ask user to re-authenticate on web
        if (!silent) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('GOOGLE AUTH EXPIRED. PLEASE RE-AUTHENTICATE ON WEB APP.'),
              duration: Duration(seconds: 5),
            ),
          );
        }
      } else {
        if (!silent) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('FAILED TO SYNC GMAIL TRANSACTION ALERTS')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error syncing emails: $e');
      if (mounted && !silent) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SYNC ERROR. SERVER MIGHT BE UNREACHABLE.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _syncStatusMessage = null;
          if (!silent) {
            if (limit > 50) _isHistoricalSyncing = false;
            else _isSyncing = false;
          }
        });
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

  Widget _buildCategoryChips() {
    final categories = [
      'All', 'Income', 'Food & Dining', 'Shopping', 'Transport', 
      'Entertainment', 'Bills & Utilities', 'Healthcare', 'Travel', 
      'Investments', 'Transfers', 'Subscriptions', 'Others'
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: categories.map((cat) {
          final isSelected = _selectedCategory == cat;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedCategory = cat;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.black : Colors.white,
                  border: Border.all(color: Colors.black, width: 2),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black,
                      offset: Offset(2, 2),
                    ),
                  ],
                ),
                child: Text(
                  cat,
                  style: GoogleFonts.inter(
                    color: isSelected ? Colors.white : Colors.black,
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  List<dynamic> _getFilteredAndSortedTransactions() {
    final filtered = _transactions.where((t) {
      if (_selectedCategory == 'All') return true;

      final category = (t['category'] ?? '').toString();
      
      // Fallback for older transactions that don't match exactly
      if (_selectedCategory == 'Food & Dining') {
        final name = (t['name'] ?? '').toString().toLowerCase();
        if (name.contains('zomato') || name.contains('swiggy') || ['food', 'dining'].contains(category.toLowerCase())) return true;
      }
      if (_selectedCategory == 'Entertainment') {
        final name = (t['name'] ?? '').toString().toLowerCase();
        if (name.contains('pvr') || name.contains('valve') || name.contains('amazon') || ['entertainment', 'ott', 'streaming', 'music', 'tech', 'work'].contains(category.toLowerCase())) return true;
      }

      return category.toLowerCase() == _selectedCategory.toLowerCase();
    }).toList();

    filtered.sort((a, b) {
      final dateA = DateTime.tryParse(a['date'] ?? '') ?? DateTime.now();
      final dateB = DateTime.tryParse(b['date'] ?? '') ?? DateTime.now();
      return dateB.compareTo(dateA);
    });

    return filtered;
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
    final allFilteredTxns = _getFilteredAndSortedTransactions();
    final bool hasMore = allFilteredTxns.length > 10;
    final displayTxns = _showAllTransactions ? allFilteredTxns : allFilteredTxns.take(10).toList();
    
    final Map<String, List<dynamic>> groupedTxns = {};
    for (var t in displayTxns) {
      final dateStr = t['date'] ?? '';
      final parsedDate = DateTime.tryParse(dateStr) ?? DateTime.now();
      final header = _formatDateHeader(parsedDate);
      groupedTxns.putIfAbsent(header, () => []).add(t);
    }

    // Calculate Weekly Flow
    List<double> incoming = List.filled(7, 0.0);
    List<double> outgoing = List.filled(7, 0.0);
    
    DateTime now = DateTime.now();
    DateTime todayStart = DateTime(now.year, now.month, now.day);
    DateTime startOfWeek = todayStart.subtract(Duration(days: now.weekday - 1));
    
    for (var t in _transactions) {
      final dateStr = t['date'] ?? '';
      final parsedDate = DateTime.tryParse(dateStr);
      if (parsedDate == null) continue;
      
      final txnDate = DateTime(parsedDate.year, parsedDate.month, parsedDate.day);
      if (txnDate.isBefore(startOfWeek) || txnDate.isAfter(todayStart)) continue;
      
      int dayIndex = txnDate.difference(startOfWeek).inDays;
      if (dayIndex >= 0 && dayIndex < 7) {
        final double amount = (t['amount'] ?? 0).toDouble();
        final String type = (t['type'] ?? 'debit').toString().toLowerCase();
        
        if (type == 'credit') {
          incoming[dayIndex] += amount;
        } else {
          outgoing[dayIndex] += amount;
        }
      }
    }

    double maxAmount = 0;
    for (int i = 0; i < 7; i++) {
      if (incoming[i] + outgoing[i] > maxAmount) {
        maxAmount = incoming[i] + outgoing[i];
      }
    }
    if (maxAmount == 0) maxAmount = 1;
    
    final double maxBarHeight = 180.0;
    
    List<List<double>> chartHeights = List.generate(7, (index) {
      if (index > now.weekday - 1) return []; // Future days empty
      
      double incH = (incoming[index] / maxAmount) * maxBarHeight;
      double outH = (outgoing[index] / maxAmount) * maxBarHeight;
      
      if (incoming[index] > 0 && incH < 2) incH = 2;
      if (outgoing[index] > 0 && outH < 2) outH = 2;
      
      return [incH, outH];
    });

    double totalIncoming = incoming.reduce((a, b) => a + b);
    double totalOutgoing = outgoing.reduce((a, b) => a + b);
    double netFlow = totalIncoming - totalOutgoing;
    
    String sign = netFlow >= 0 ? '+' : '-';
    String weeklyFlowText = '$sign\₹${netFlow.abs().toStringAsFixed(2)}';
    Color weeklyFlowColor = netFlow >= 0 ? const Color(0xFF3B8000) : const Color(0xFFFF4C4C);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        automaticallyImplyLeading: false,
        leading: Navigator.canPop(context) 
            ? IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.black),
                onPressed: () => Navigator.of(context).pop(),
              )
            : null,
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
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: _buildDeepSyncButton(),
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
                // Graphs PageView
                SizedBox(
                  height: 365,
                  child: PageView(
                    controller: _graphPageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentGraphIndex = index;
                      });
                    },
                    children: [
                      // Weekly Flow Card
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0, right: 8.0, bottom: 8.0),
                        child: _buildNeobrutalistCard(
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
                                  weeklyFlowText,
                                  style: GoogleFonts.inter(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 20,
                                    color: weeklyFlowColor,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            // Bar Chart
                            SizedBox(
                              height: 240,
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  _buildDividedChartColumn('MON', chartHeights[0], incoming[0], outgoing[0]),
                                  _buildDividedChartColumn('TUE', chartHeights[1], incoming[1], outgoing[1]),
                                  _buildDividedChartColumn('WED', chartHeights[2], incoming[2], outgoing[2]),
                                  _buildDividedChartColumn('THU', chartHeights[3], incoming[3], outgoing[3]),
                                  _buildDividedChartColumn('FRI', chartHeights[4], incoming[4], outgoing[4]),
                                  _buildDividedChartColumn('SAT', chartHeights[5], incoming[5], outgoing[5]),
                                  _buildDividedChartColumn('SUN', chartHeights[6], incoming[6], outgoing[6]),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      ),
                      // Pie Chart Card
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0, right: 8.0, bottom: 8.0),
                        child: _buildPieChartCard(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildPageIndicator(0),
                    const SizedBox(width: 8),
                    _buildPageIndicator(1),
                  ],
                ),
                const SizedBox(height: 24),
                _buildCategoryChips(),
                const SizedBox(height: 24),
                
                if (_isLoading || _isHistoricalSyncing)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 60.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          LoadingAnimationWidget.staggeredDotsWave(
                            color: Colors.black,
                            size: 40,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _syncStatusMessage ?? (_isHistoricalSyncing ? 'PERFORMING DEEP SYNC...' : 'LOADING TRANSACTIONS HISTORY...'),
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
                          
                          final Color iconColor = isCredit ? const Color(0xFF9AFF00) : const Color(0xFFFF4C4C);
                          final Color amountColor = isCredit ? const Color(0xFF3B8000) : Colors.black;
                          final IconData icon = _getIconForCategory(t['category'] ?? '');
                          final String categoryStr = (t['category'] ?? 'UNKNOWN').toString().toUpperCase();
                          final String subtitle = '$categoryStr • $dateHeader';
                          
                          return _buildTransactionCard(
                            icon: icon,
                            title: title,
                            subtitle: subtitle,
                            amount: '$sign\$$amountVal',
                            iconColor: iconColor,
                            amountColor: amountColor,
                          );
                        },
                      ),
                      const SizedBox(height: 2),
                    ];
                  }),
                  
                if (hasMore)
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0, bottom: 24.0),
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _showAllTransactions = !_showAllTransactions;
                        });
                      },
                      child: Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: _showAllTransactions ? Colors.white : const Color(0xFF2954FF),
                          border: Border.all(color: Colors.black, width: 2),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black,
                              offset: Offset(4, 4),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: Text(
                            _showAllTransactions ? 'SHOW LESS' : 'SEE ALL',
                            style: GoogleFonts.inter(
                              color: _showAllTransactions ? Colors.black : Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
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
            boxShadow: const [
              BoxShadow(
                color: Colors.black,
                offset: Offset(2, 2),
              ),
            ],
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

  Widget _buildDividedChartColumn(String label, List<double> heights, [double incomingAmt = 0, double outgoingAmt = 0]) {
    final colors = [
      const Color(0xFF9AFF00), // Green (Incoming)
      const Color(0xFFFF4C4C), // Red (Outgoing)
    ];
    
    bool isEmpty = heights.isEmpty || heights.every((h) => h == 0);
    
    return Tooltip(
      message: 'In: ₹${incomingAmt.toStringAsFixed(0)} | Out: ₹${outgoingAmt.toStringAsFixed(0)}',
      triggerMode: TooltipTriggerMode.tap,
      preferBelow: false,
      textStyle: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
      decoration: BoxDecoration(
        color: Colors.black87,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
        if (isEmpty)
          const SizedBox(width: 28) // Placeholder to maintain width
        else
          Container(
            width: 28,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black, width: 1.5),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black,
                  offset: Offset(2, 2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.end,
              children: List.generate(heights.length, (index) {
                if (heights[index] == 0) return const SizedBox.shrink();
                
                // Determine if this is the first non-zero element to avoid drawing a top border for it
                bool isFirstNonZero = true;
                for (int i = 0; i < index; i++) {
                  if (heights[i] > 0) {
                    isFirstNonZero = false;
                    break;
                  }
                }
                
                return Container(
                  width: double.infinity,
                  height: heights[index],
                  decoration: BoxDecoration(
                    color: colors[index % colors.length],
                    border: isFirstNonZero ? null : const Border(top: BorderSide(color: Colors.black, width: 1.5)),
                  ),
                );
              }),
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
      ),
    );
  }

  Widget _buildPageIndicator(int index) {
    bool isActive = _currentGraphIndex == index;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: isActive ? 24 : 12,
      height: 12,
      decoration: BoxDecoration(
        color: isActive ? Colors.black : Colors.white,
        border: Border.all(color: Colors.black, width: 2),
        borderRadius: BorderRadius.circular(6),
        boxShadow: const [
          BoxShadow(
            color: Colors.black,
            offset: Offset(2, 2),
          ),
        ],
      ),
    );
  }

  Widget _buildPieChartCard() {
    final categories = [
      'Food & Dining', 'Shopping', 'Transport', 
      'Entertainment', 'Bills & Utilities', 'Healthcare', 'Travel', 
      'Investments', 'Transfers', 'Subscriptions', 'Others'
    ];
    
    Map<String, double> categoryTotals = {
      for (var cat in categories) cat: 0.0
    };
    
    for (var t in _transactions) {
      final String type = (t['type'] ?? 'debit').toString().toLowerCase();
      if (type == 'credit') continue;
      
      final String category = (t['category'] ?? '').toString().toLowerCase();
      final String name = (t['name'] ?? '').toString().toLowerCase();
      final double amount = (t['amount'] ?? 0).toDouble();
      
      String matchedCat = 'Others';
      
      if (name.contains('zomato') || name.contains('swiggy') || ['food', 'dining'].contains(category)) {
        matchedCat = 'Food & Dining';
      } else if (name.contains('pvr') || name.contains('valve') || name.contains('amazon') || ['entertainment', 'ott', 'streaming', 'music', 'tech', 'work'].contains(category)) {
        matchedCat = 'Entertainment';
      } else {
        for (var cat in categories) {
          if (cat == 'Others') continue;
          if (category == cat.toLowerCase() || category.contains(cat.toLowerCase().split(' ')[0])) {
            matchedCat = cat;
            break;
          }
        }
      }
      
      categoryTotals[matchedCat] = categoryTotals[matchedCat]! + amount;
    }

    final Map<String, Color> categoryColors = {
      'Food & Dining': const Color(0xFF9C27B0), // Purple
      'Shopping': const Color(0xFFE91E63), // Pink
      'Transport': const Color(0xFF2196F3), // Blue
      'Entertainment': const Color(0xFFFF9800), // Orange
      'Bills & Utilities': const Color(0xFF4CAF50), // Green
      'Healthcare': const Color(0xFFF44336), // Red
      'Travel': const Color(0xFF00BCD4), // Cyan
      'Investments': const Color(0xFF3F51B5), // Indigo
      'Transfers': const Color(0xFF607D8B), // Blue Grey
      'Subscriptions': const Color(0xFF795548), // Brown
      'Others': const Color(0xFFFFDE43), // Yellow
    };

    final sortedEntries = categoryTotals.entries.where((e) => e.value > 0).toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    List<PieChartSectionData> sections = [];
    int index = 0;
    
    for (var entry in sortedEntries) {
      final isTouched = index == _touchedPieIndex;
      final double radius = isTouched ? 75.0 : 65.0;
      final String title = isTouched ? '${entry.key}\n\₹${entry.value.toInt()}' : '\₹${entry.value.toInt()}';
      
      sections.add(
        PieChartSectionData(
          color: categoryColors[entry.key] ?? Colors.grey,
          value: entry.value,
          title: title,
          titleStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w900,
            fontSize: isTouched ? 12 : 10,
            color: Colors.white,
            shadows: [const Shadow(color: Colors.black, blurRadius: 2)],
          ),
          radius: radius,
          borderSide: const BorderSide(color: Colors.black, width: 2),
        ),
      );
      index++;
    }

    if (sections.isEmpty) {
      sections.add(
        PieChartSectionData(
          color: Colors.grey,
          value: 1,
          title: '',
          radius: 65,
          borderSide: const BorderSide(color: Colors.black, width: 2),
        )
      );
    }

    return _buildNeobrutalistCard(
      color: const Color(0xFFF4F4F4),
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'EXPENSES\nBY CATEGORY',
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w900,
              fontSize: 24,
              height: 1.1,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: Center(
              child: SizedBox(
                width: 200,
                height: 200,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.black, width: 2.5),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black,
                        offset: Offset(4, 4),
                      ),
                    ],
                  ),
                  child: PieChart(
                    PieChartData(
                      pieTouchData: PieTouchData(
                        touchCallback: (FlTouchEvent event, pieTouchResponse) {
                          setState(() {
                            if (!event.isInterestedForInteractions ||
                                pieTouchResponse == null ||
                                pieTouchResponse.touchedSection == null) {
                              _touchedPieIndex = -1;
                              return;
                            }
                            _touchedPieIndex = pieTouchResponse.touchedSection!.touchedSectionIndex;
                          });
                        },
                      ),
                      sectionsSpace: 0,
                      centerSpaceRadius: 30,
                      sections: sections,
                      borderData: FlBorderData(show: false),
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

  Widget _buildDeepSyncButton() {
    return GestureDetector(
      onTap: () {
        if (!_isHistoricalSyncing && !_isSyncing) {
          _syncEmails(silent: false, limit: 200);
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF9AFF00), // Vibrant Green
          shape: BoxShape.circle,
          border: Border.all(color: Colors.black, width: 2),
          boxShadow: const [
            BoxShadow(
              color: Colors.black,
              offset: Offset(3, 3),
            ),
          ],
        ),
        padding: const EdgeInsets.all(8),
        child: const Icon(
          Icons.sync,
          color: Colors.black,
          size: 18,
        ),
      ),
    );
  }
}
