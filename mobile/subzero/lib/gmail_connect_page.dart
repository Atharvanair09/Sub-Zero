import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'auth_service.dart';

/// Guides the user through the Gmail OAuth consent flow natively in the app.
///
/// Flow:
/// 1. Tap "Connect Gmail" → fetch auth URL from backend
/// 2. Open URL in external browser (user grants gmail.readonly consent)
/// 3. Backend callback saves tokens + sets gmailConnected=true
/// 4. User returns to app → we poll /api/users/gmail-status
/// 5. On success, update AuthService and pop with result=true
class GmailConnectPage extends StatefulWidget {
  const GmailConnectPage({super.key});

  @override
  State<GmailConnectPage> createState() => _GmailConnectPageState();
}

class _GmailConnectPageState extends State<GmailConnectPage> {
  static const String _baseUrl = 'https://sub-zero-50le.onrender.com';

  _ConnectState _state = _ConnectState.idle;
  String? _errorMessage;
  Timer? _pollTimer;
  int _pollCount = 0;
  static const int _maxPolls = 20; // poll up to 20×3s = 60 seconds

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  // ── Step 1: Request Gmail Scopes Natively ───────────────────────────────
  Future<void> _startOAuthFlow() async {
    setState(() {
      _state = _ConnectState.launching;
      _errorMessage = null;
    });

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      );
      
      // Try to sign in or request additional scopes if already signed in
      final GoogleSignInAccount? account = await googleSignIn.signIn();
      
      if (account == null) {
        setState(() {
          _state = _ConnectState.idle;
          _errorMessage = 'Sign in aborted';
        });
        return;
      }

      // Mark as connected in our local session
      await AuthService.instance.setGmailConnected(true);

      if (mounted) {
        setState(() => _state = _ConnectState.success);
        await Future.delayed(const Duration(milliseconds: 1500));
        if (mounted) Navigator.of(context).pop(true);
      }
    } catch (e) {
      setState(() {
        _state = _ConnectState.error;
        _errorMessage = e.toString();
      });
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(false),
        ),
        title: Text(
          'CONNECT GMAIL',
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
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: _buildBody(),
        ),
      ),
    );
  }

  Widget _buildBody() {
    switch (_state) {
      case _ConnectState.idle:
        return _buildIntro();
      case _ConnectState.launching:
        return _buildLaunching();
      case _ConnectState.waiting:
        return _buildWaiting();
      case _ConnectState.success:
        return _buildSuccess();
      case _ConnectState.error:
        return _buildError();
    }
  }

  Widget _buildIntro() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 32),
        // Icon block
        Center(
          child: Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.black, width: 2.5),
              boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
            ),
            child: const Center(
              child: Icon(Icons.mail_outline, size: 48, color: Colors.black),
            ),
          ),
        ),
        const SizedBox(height: 32),
        Text(
          'AUTO-DETECT\nTRANSACTIONS',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w900,
            fontSize: 28,
            letterSpacing: -0.5,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'SubZero will scan your Gmail for bank alerts and billing emails to automatically detect subscriptions and transactions.',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.black54,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 32),
        // Permissions box
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF9AFF00),
            border: Border.all(color: Colors.black, width: 2),
            boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'PERMISSIONS REQUESTED',
                style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1),
              ),
              const SizedBox(height: 12),
              _permissionRow('Read emails (billing keywords only)'),
              const SizedBox(height: 6),
              _permissionRow('Never store email content'),
              const SizedBox(height: 6),
              _permissionRow('Revoke anytime from Google Account'),
            ],
          ),
        ),
        const Spacer(),
        // CTA
        GestureDetector(
          onTap: _startOAuthFlow,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              color: Colors.black,
              border: Border.all(color: Colors.black, width: 2.5),
              boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(5, 5))],
            ),
            child: Center(
              child: Text(
                'CONNECT GMAIL',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  letterSpacing: 1,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: Text(
            'Maybe later',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.black54,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _permissionRow(String text) {
    return Row(
      children: [
        const Icon(Icons.check, size: 16, color: Colors.black),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildLaunching() {
    return const Center(child: CircularProgressIndicator(color: Colors.black));
  }

  Widget _buildWaiting() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(
          width: 64,
          height: 64,
          child: CircularProgressIndicator(color: Colors.black, strokeWidth: 4),
        ),
        const SizedBox(height: 32),
        Text(
          'WAITING FOR\nAUTHORIZATION',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: -0.5,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Complete the sign-in in your browser, then return to this app.',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 14, color: Colors.black54, height: 1.5),
        ),
        const SizedBox(height: 32),
        TextButton(
          onPressed: () => setState(() {
            _pollTimer?.cancel();
            _state = _ConnectState.idle;
          }),
          child: Text(
            'Cancel',
            style: GoogleFonts.inter(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccess() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            color: const Color(0xFF9AFF00),
            border: Border.all(color: Colors.black, width: 2.5),
            boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
          ),
          child: const Center(child: Icon(Icons.check, size: 48, color: Colors.black)),
        ),
        const SizedBox(height: 24),
        Text(
          'GMAIL CONNECTED!',
          style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 24, letterSpacing: -0.5),
        ),
        const SizedBox(height: 12),
        Text(
          'SubZero will now automatically detect your subscriptions and transactions.',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 14, color: Colors.black54, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildError() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: const Color(0xFFFFD6D6),
              border: Border.all(color: Colors.black, width: 2.5),
              boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
            ),
            child: const Center(child: Icon(Icons.error_outline, size: 48, color: Colors.black)),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'CONNECTION FAILED',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 22, letterSpacing: -0.5),
        ),
        if (_errorMessage != null) ...[
          const SizedBox(height: 12),
          Text(
            _errorMessage!,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 13, color: Colors.black54, height: 1.5),
          ),
        ],
        const SizedBox(height: 32),
        GestureDetector(
          onTap: () => setState(() {
            _state = _ConnectState.idle;
            _errorMessage = null;
          }),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: Colors.black,
              border: Border.all(color: Colors.black, width: 2),
              boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
            ),
            child: Center(
              child: Text(
                'TRY AGAIN',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 13,
                  letterSpacing: 1,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

enum _ConnectState { idle, launching, waiting, success, error }
