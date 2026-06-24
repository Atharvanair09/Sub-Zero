import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'auth_service.dart';
import 'login_screen.dart';
import 'home_page.dart';
import 'goals_page.dart';
import 'gmail_connect_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Future<void> _handleLogout(BuildContext context) async {
    // Sign out from Google and clear the canonical session
    await GoogleSignIn().signOut();
    await AuthService.instance.clearSession();
    if (context.mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (Route<dynamic> route) => false,
      );
    }
  }


  /// Opens the Gmail connect flow and refreshes UI when it returns.
  Future<void> _openGmailConnect(BuildContext context) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const GmailConnectPage()),
    );
    // If the user successfully connected Gmail, rebuild so the tile updates
    if (result == true && mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth    = AuthService.instance;
    final name    = (auth.name ?? 'USER').toUpperCase();
    final email   = auth.email ?? '';
    final photo   = auth.photoUrl;
    final gmailConnected = auth.gmailConnected;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        automaticallyImplyLeading: false,
        toolbarHeight: 70, // give some room for stacked text
        centerTitle: true,
        title: Text(
          'PROFILE',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 20,
            height: 1.0,
            letterSpacing: -0.5,
          ),
        ),
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
              const SizedBox(height: 16),
              
              // Main Profile Card
              _buildNeobrutalistCard(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                child: Column(
                  children: [
                    // Avatar with shadow
                    // Avatar
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        border: Border.all(color: Colors.black, width: 2.5),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black,
                            offset: Offset(6, 6),
                          ),
                        ],
                        image: photo != null
                            ? DecorationImage(
                                image: NetworkImage(photo),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: photo == null
                          ? Icon(Icons.person, size: 60, color: Colors.grey[600])
                          : null,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      name,
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w900,
                        fontSize: 32,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF9AFF00),
                        border: Border.all(color: Colors.black, width: 2),
                      ),
                      child: Text(
                        'PLATINUM MEMBER',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (email.isNotEmpty)
                      Text(
                        email,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: Colors.black54,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      'Member since ${DateTime.now().year}',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.black87,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // PERSONAL INFORMATION Section
              _buildSectionCard(
                title: 'PERSONAL\nINFORMATION',
                children: [
                  _buildListItem(title: 'EDIT PROFILE'),
                  const SizedBox(height: 8),
                  _buildListItem(title: 'LINKED ACCOUNTS'),
                  const SizedBox(height: 8),
                  _buildListItem(title: 'DOCUMENT VAULT'),
                ],
              ),
              const SizedBox(height: 24),

              // GMAIL INTEGRATION Section
              _buildSectionCard(
                title: 'GMAIL\nINTEGRATION',
                children: [
                  GestureDetector(
                    onTap: gmailConnected ? null : () => _openGmailConnect(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: gmailConnected ? const Color(0xFF9AFF00) : Colors.white,
                        border: Border.all(color: Colors.black, width: 2),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            gmailConnected ? Icons.check_circle : Icons.mail_outline,
                            size: 20,
                            color: Colors.black,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  gmailConnected ? 'GMAIL CONNECTED' : 'CONNECT GMAIL',
                                  style: GoogleFonts.inter(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  gmailConnected
                                      ? 'Auto-detecting transactions'
                                      : 'Tap to enable auto-detection',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    color: Colors.black54,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!gmailConnected)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              color: Colors.black,
                              child: Text(
                                'CONNECT',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 10,
                                ),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              color: Colors.black,
                              child: Text(
                                'ACTIVE',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // APP SETTINGS Section
              _buildSectionCard(
                title: 'APP SETTINGS',
                children: [
                  _buildToggleItem(title: 'DARK MODE', value: false),
                  const SizedBox(height: 8),
                  _buildListItem(title: 'NOTIFICATIONS'),
                  const SizedBox(height: 8),
                  _buildListItem(title: 'SECURITY', badge: 'PRO'),
                ],
              ),
              const SizedBox(height: 24),

              // SUPPORT & LEGAL Section
              _buildSectionCard(
                title: 'SUPPORT & LEGAL',
                children: [
                  _buildIconListItem(icon: Icons.help_outline, title: 'HELP CENTER'),
                  const SizedBox(height: 8),
                  _buildIconListItem(icon: Icons.shield_outlined, title: 'PRIVACY POLICY'),
                  const SizedBox(height: 8),
                  _buildIconListItem(icon: Icons.gavel_outlined, title: 'TERMS OF SERVICE'),
                ],
              ),
              const SizedBox(height: 32),

              // LOGOUT Button
              GestureDetector(
                onTap: () => _handleLogout(context),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFB00000), // Dark red
                    border: Border.all(color: Colors.black, width: 2.5),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black,
                        offset: Offset(6, 6),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'LOGOUT',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        fontSize: 16,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // --- Helper Methods ---

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

  Widget _buildSectionCard({required String title, required List<Widget> children}) {
    return _buildNeobrutalistCard(
      color: Colors.white,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
              fontSize: 18,
              letterSpacing: 0.5,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 12),
          Container(height: 2, color: Colors.black),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildListItem({required String title, String? badge}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
      ),
      child: Row(
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              letterSpacing: 0.5,
            ),
          ),
          if (badge != null) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              color: Colors.black,
              child: Text(
                badge,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildIconListItem({required IconData icon, required String title}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Text(
            title,
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleItem({required String title, required bool value}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              letterSpacing: 0.5,
            ),
          ),
          Container(
            width: 40,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              border: Border.all(color: Colors.black, width: 2),
            ),
            alignment: value ? Alignment.centerRight : Alignment.centerLeft,
            child: Container(
              width: 16,
              height: 16,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }

}
