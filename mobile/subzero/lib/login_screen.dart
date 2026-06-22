import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'onboarding_screen.dart'; // for OffsetShadowBox
import 'home_page.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isLoading = false;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }

      // Sync with backend using email as the canonical key.
      // We send googleId (the Google sub ID) so the backend can link it
      // to any existing account that was created from web (Clerk).
      final String backendUrl = 'https://sub-zero-50le.onrender.com/api/users/sync';

      final response = await http.post(
        Uri.parse(backendUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'googleId': googleUser.id,    // Google subject ID
          'email':    googleUser.email, // canonical key — links to web account
          'fullName': googleUser.displayName ?? '',
          'imageUrl': googleUser.photoUrl ?? '',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['user'] != null) {
          // Persist the canonical MongoDB _id — same userId the web uses
          final canonicalId = data['user']['userId'] ?? data['user']['_id'];
          await AuthService.instance.saveSession(
            userId:   canonicalId.toString(),
            email:    googleUser.email,
            name:     googleUser.displayName,
            photoUrl: googleUser.photoUrl,
          );

          if (mounted) {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const HomePage()),
              (Route<dynamic> route) => false,
            );
          }
        } else {
          throw Exception('Backend sync returned failure');
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to sync with backend: ${response.statusCode}')),
          );
        }
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sign in failed: $error')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                // Header
                Row(
                  children: [
                    Image.asset(
                      'assets/logo.png',
                      width: 32,
                      height: 32,
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'SUBZERO',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Colors.black,
                        letterSpacing: -1,
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.notifications_none, color: Colors.black, size: 28),
                  ],
                ),
                
                const SizedBox(height: 60),
                
                // Bank Icon
                Center(
                  child: SizedBox(
                    width: 80,
                    height: 80,
                    child: OffsetShadowBox(
                      color: Colors.white,
                      child: const Center(
                        child: Icon(Icons.account_balance, size: 40, color: Colors.black),
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // WELCOME BACK
                const Text(
                  'WELCOME BACK',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    color: Colors.black,
                    letterSpacing: -0.5,
                  ),
                ),
                
                const SizedBox(height: 20),
                

                
                const SizedBox(height: 24),

                GestureDetector(
                  onTap: _isLoading ? null : _handleGoogleSignIn,
                  child: OffsetShadowBox(
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (_isLoading)
                            const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.black, width: 2),
                              ),
                              child: const Text('G', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, height: 1)),
                            ),
                          const SizedBox(width: 8),
                          Text(_isLoading ? 'SIGNING IN...' : 'CONTINUE WITH GOOGLE', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1)),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Divider line
                Container(
                  height: 4,
                  color: Colors.black,
                ),
                
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {},
                        child: const OffsetShadowBox(
                          color: Color(0xFFF4F4F4),
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Center(
                              child: Text(
                                'FORGOT PASSWORD?',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.black,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {},
                        child: const OffsetShadowBox(
                          color: Colors.black,
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Center(
                              child: Text(
                                'CREATE ACCOUNT',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 365),
                
                // Footer
                Row(
                  children: [
                    const Text(
                      '© 2024 SUB-ZERO FINANCE CO.',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
