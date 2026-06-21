import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'auth_service.dart';
import 'profile_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

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
                      '\$142,527.90',
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
                    child: _buildActionButton(
                      icon: Icons.add,
                      label: 'ADD',
                      color: const Color(0xFF9AFF00),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.qr_code_scanner,
                      label: 'SCAN',
                      color: const Color(0xFFE5E5FF),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.payments_outlined,
                      label: 'PAY',
                      color: Colors.white,
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
              const SizedBox(height: 24),
              // Monthly Outflow
              _buildNeobrutalistCard(
                color: const Color(0xFFFFD6D6),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MONTHLY OUTFLOW',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        color: const Color(0xFFB00000),
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '-\$12,402.15',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w900,
                        fontSize: 32,
                        color: const Color(0xFFB00000),
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'BUDGET USED',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w800,
                            fontSize: 10,
                            letterSpacing: 1,
                          ),
                        ),
                        Text(
                          '82%',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w800,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 24,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.black, width: 2),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 82,
                            child: Container(
                              color: const Color(0xFFCC0000),
                            ),
                          ),
                          Expanded(
                            flex: 18,
                            child: Container(),
                          ),
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
                  Text(
                    'VIEW ALL',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.black, thickness: 2),
              const SizedBox(height: 16),
              _buildTransactionItem(
                icon: Icons.shopping_bag_outlined,
                title: 'Apple Store\nSoho',
                subtitle: 'TECH & ELECTRONICS\n• 2H AGO',
                amount: '-\$2,149.00',
                iconColor: const Color(0xFFE5E5FF),
              ),
              const SizedBox(height: 16),
              _buildTransactionItem(
                icon: Icons.restaurant_outlined,
                title: 'The Nomad\nLibrary',
                subtitle: 'DINING • 5H AGO',
                amount: '-\$342.50',
                iconColor: const Color(0xFF9AFF00),
              ),
              const SizedBox(height: 16),
              _buildTransactionItem(
                icon: Icons.account_balance_wallet_outlined,
                title: 'Deposit from\nExternal',
                subtitle: 'INCOME •\nYESTERDAY',
                amount: '+\$5,000.00',
                amountColor: const Color(0xFF3B8000),
                iconColor: const Color(0xFFFFF0D4),
              ),
              const SizedBox(height: 16),
              _buildTransactionItem(
                icon: Icons.bolt_outlined,
                title: 'ConEd Utilities',
                subtitle: 'BILLS • YESTERDAY',
                amount: '-\$185.20',
                iconColor: const Color(0xFFE5E5FF),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Colors.black, width: 2)),
          color: Colors.white,
        ),
        height: 70,
        child: Row(
          children: [
            _buildBottomNavItem(context, Icons.home_filled, 'HOME', true, null),
            _buildBottomNavItem(context, Icons.history, 'HISTORY', false, null),
            _buildBottomNavItem(context, Icons.adjust, 'GOALS', false, null),
            _buildBottomNavItem(context, Icons.auto_awesome_outlined, 'AI', false, null),
            _buildBottomNavItem(context, Icons.person_outline, 'PROFILE', false, const ProfilePage()),
          ],
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
              fontSize: 10,
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

  Widget _buildTransactionItem({
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

  Widget _buildBottomNavItem(BuildContext context, IconData icon, String label, bool isSelected, Widget? targetPage) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          if (!isSelected && targetPage != null) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => targetPage),
            );
          }
        },
        child: Container(
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF0044FF) : Colors.white,
            border: const Border(right: BorderSide(color: Colors.black, width: 2)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: isSelected ? Colors.white : Colors.black,
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: GoogleFonts.inter(
                  color: isSelected ? Colors.white : Colors.black,
                  fontWeight: FontWeight.w900,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
