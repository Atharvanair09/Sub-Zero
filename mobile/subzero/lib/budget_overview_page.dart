import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'custom_navbar.dart';

class BudgetOverviewPage extends StatefulWidget {
  const BudgetOverviewPage({super.key});

  @override
  State<BudgetOverviewPage> createState() => _BudgetOverviewPageState();
}

class _BudgetOverviewPageState extends State<BudgetOverviewPage> {
  int _currentIndex = 2; // BUDGET is index 2

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F4F6),
        elevation: 0,
        title: Text(
          'BUDGET',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SAVINGS\nGOALS',
                        style: GoogleFonts.inter(
                          color: Colors.black,
                          fontSize: 36,
                          height: 1.0,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'FOCUSING YOUR CAPITAL ON WHAT\nMATTERS',
                        style: GoogleFonts.inter(
                          color: const Color(0xFFE65100), // Deep orange
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(
                    color: Colors.black,
                  ),
                  child: Column(
                    children: [
                      Text('3', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      Text('ACTIVE', style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Tokyo Trip Card
            Container(
              decoration: BoxDecoration(
                color: Colors.black,
                border: Border.all(color: Colors.black, width: 2),
                boxShadow: const [
                  BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top section (Black background, white TRAVEL tag, plane icon)
                  Stack(
                    children: [
                      Positioned(
                        right: 10,
                        top: -10,
                        child: Icon(Icons.flight, color: Colors.white.withOpacity(0.2), size: 80),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: Colors.black, width: 2),
                            ),
                            child: Text(
                              'TRAVEL',
                              style: GoogleFonts.inter(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Blue section
                  Container(
                    color: const Color(0xFF2962FF), // Primary Blue
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TOKYO TRIP',
                          style: GoogleFonts.inter(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('SAVED', style: GoogleFonts.inter(color: Colors.white.withOpacity(0.7), fontSize: 10, fontWeight: FontWeight.bold)),
                                Text('\$3.4k', style: GoogleFonts.inter(color: Colors.white.withOpacity(0.7), fontSize: 16, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(width: 24),
                            Container(width: 1, height: 30, color: Colors.white.withOpacity(0.3)),
                            const SizedBox(width: 24),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('LEFT', style: GoogleFonts.inter(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900)),
                                Text('\$1.6k', style: GoogleFonts.inter(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w900)),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Progress section
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Text('PROGRESS 68%', style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            height: 16,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 68,
                                  child: Container(color: const Color(0xFFC6FF00)), // Bright green
                                ),
                                Expanded(
                                  flex: 32,
                                  child: Container(color: Colors.white),
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
            ),
            const SizedBox(height: 16),

            // Two smaller cards
            Row(
              children: [
                Expanded(
                  child: _buildSmallCard(
                    title: 'NEW CAR',
                    color: const Color(0xFFC6FF00),
                    icon: Icons.directions_car,
                    amountLeft: '\$23K LEFT',
                    progress: 0.3,
                    progressColor: const Color(0xFF2962FF),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildSmallCard(
                    title: 'SAFETY NET',
                    color: const Color(0xFFE0E0E0),
                    icon: Icons.security,
                    amountLeft: '\$1.5K LEFT',
                    progress: 0.8,
                    progressColor: Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // GOAL CONTRIBUTIONS
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'GOAL\nCONTRIBUTIONS',
                  style: GoogleFonts.inter(color: Colors.black, fontSize: 20, height: 1.0, fontWeight: FontWeight.w900),
                ),
                Text(
                  'LAST 6\nMONTHS',
                  textAlign: TextAlign.right,
                  style: GoogleFonts.inter(color: const Color(0xFF2962FF), fontSize: 12, height: 1.1, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(height: 3, color: Colors.black),
            const SizedBox(height: 16),

            // Bar Chart
            Container(
              height: 240,
              padding: const EdgeInsets.only(top: 24, left: 16, right: 16, bottom: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 3),
                boxShadow: const [
                  BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                ],
              ),
              child: Column(
                children: [
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _buildBar(0.4, const Color(0xFF2962FF)),
                        _buildBar(0.6, const Color(0xFFC6FF00)),
                        _buildBar(0.5, const Color(0xFF2962FF)),
                        _buildBar(0.8, const Color(0xFFC6FF00)),
                        _buildBar(0.7, const Color(0xFF2962FF)),
                        _buildBar(0.95, const Color(0xFFC6FF00)),
                      ],
                    ),
                  ),
                  Container(
                    height: 3,
                    color: Colors.black,
                    margin: const EdgeInsets.only(top: 8, bottom: 8),
                  ),
                  Row(
                    children: [
                      _buildLabel('JAN'),
                      _buildLabel('FEB'),
                      _buildLabel('MAR'),
                      _buildLabel('APR'),
                      _buildLabel('MAY'),
                      _buildLabel('JUN'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // RECENT DEPOSITS
            Text(
              'RECENT DEPOSITS',
              style: GoogleFonts.inter(color: Colors.black, fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Container(height: 3, color: Colors.black),
            const SizedBox(height: 16),

            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 3),
                boxShadow: const [
                  BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                ],
              ),
              child: Column(
                children: [
                  _buildDepositItem('TOKYO TRIP', '+\$200.00'),
                  Container(height: 2, color: Colors.black),
                  _buildDepositItem('NEW CAR', '+\$1,500.00'),
                  Container(height: 2, color: Colors.black),
                  _buildDepositItem('EMERGENCY FUND', '+\$450.00'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Bottom Buttons
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      border: Border.all(color: Colors.black, width: 3),
                      boxShadow: const [
                        BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        'VIEW FULL HISTORY',
                        style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFFC6FF00),
                    border: Border.all(color: Colors.black, width: 3),
                    boxShadow: const [
                      BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.add, color: Colors.black, size: 32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallCard({
    required String title,
    required Color color,
    required IconData icon,
    required String amountLeft,
    required double progress,
    required Color progressColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: Colors.black, width: 3),
        boxShadow: const [
          BoxShadow(color: Colors.black, offset: Offset(4, 4)),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: Colors.black),
          const SizedBox(height: 4),
          Text(title, style: GoogleFonts.inter(color: Colors.black, fontSize: 12, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Container(
            height: 8,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black, width: 1.5),
              color: Colors.white,
            ),
            child: Row(
              children: [
                Expanded(
                  flex: (progress * 100).toInt(),
                  child: Container(color: progressColor),
                ),
                Expanded(
                  flex: ((1 - progress) * 100).toInt(),
                  child: Container(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(amountLeft, style: GoogleFonts.inter(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildBar(double heightFactor, Color color) {
    return Expanded(
      child: Align(
        alignment: Alignment.bottomCenter,
        child: FractionallySizedBox(
          heightFactor: heightFactor,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: color,
              border: Border.all(color: Colors.black, width: 2),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Expanded(
      child: Center(
        child: Text(
          text,
          style: GoogleFonts.inter(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }

  Widget _buildDepositItem(String title, String amount) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.black, width: 2),
            ),
            child: const Center(
              child: Icon(Icons.add, size: 16, color: Colors.black),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: GoogleFonts.inter(color: Colors.black, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          Text(
            amount,
            style: GoogleFonts.inter(color: const Color(0xFF2962FF), fontSize: 14, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}
