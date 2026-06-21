import 'package:flutter/material.dart';
import 'login_screen.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      body: SafeArea(
        child: Stack(
          children: [
            // Background faint shapes/icons
            Positioned(
              top: 100,
              left: 40,
              child: Transform.rotate(
                angle: 0.785, // 45 degrees
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.withOpacity(0.3), width: 4),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 450,
              left: 150,
              child: Icon(Icons.account_balance, size: 40, color: Colors.grey.withOpacity(0.3)),
            ),
            Positioned(
              top: 500,
              right: 30,
              child: Icon(Icons.trending_up, size: 60, color: Colors.grey.withOpacity(0.3)),
            ),
            Positioned(
              bottom: 150,
              left: 70,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey.withOpacity(0.2),
                ),
              ),
            ),
            
            // Main content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 50),
                  // SUBZERO
                  const Text(
                    'SUBZERO',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 60,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                      letterSpacing: -2.5,
                      height: 1.0,
                    ),
                  ),
                  const SizedBox(height: 80),
                  
                  // FINANCE WITHOUT THE FRICTION
                  OffsetShadowBox(
                    angle: -0.05,
                    color: const Color(0xFFEEEEEE),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                      child: Text(
                        'FINANCE WITHOUT\nTHE FRICTION.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.black,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                  
                  // Two Cards
                  SizedBox(
                    height: 160,
                    child: Stack(
                      children: [
                        // Right Card (Black image placeholder)
                        Positioned(
                          right: 0,
                          top: 10,
                          child: OffsetShadowBox(
                            angle: 0.05,
                            color: Colors.black,
                            child: SizedBox(
                              width: MediaQuery.of(context).size.width * 0.45,
                              height: 120,
                              child: const Center(
                                child: Icon(Icons.credit_card, color: Colors.white, size: 40),
                              ),
                            ),
                          ),
                        ),
                        
                        // Left Card (Blue lightning)
                        Positioned(
                          left: 0,
                          top: 0,
                          child: OffsetShadowBox(
                            angle: -0.05,
                            color: const Color(0xFF2962FF),
                            child: SizedBox(
                              width: MediaQuery.of(context).size.width * 0.45,
                              height: 130,
                              child: const Center(
                                child: Icon(Icons.flash_on, color: Colors.white, size: 60),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const Spacer(),
                  
                  // GET STARTED Button
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                      );
                    },
                    child: OffsetShadowBox(
                      angle: 0,
                      color: const Color(0xFFB2FF05),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'GET STARTED',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w700,
                                color: Colors.black,
                                height: 1.0,
                              ),
                            ),
                            SizedBox(width: 24),
                            Icon(Icons.arrow_forward, color: Colors.black, size: 40),
                          ],
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                  
                  // Footer
                  const Text(
                    'MEMBER OF THE GLOBAL TRUST\nNETWORK',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Colors.grey,
                      letterSpacing: 1.5,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OffsetShadowBox extends StatelessWidget {
  final Widget child;
  final Color color;
  final double angle;

  const OffsetShadowBox({
    super.key,
    required this.child,
    required this.color,
    this.angle = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: angle,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: 6,
            left: 6,
            right: -6,
            bottom: -6,
            child: Container(color: Colors.black),
          ),
          Container(
            decoration: BoxDecoration(
              color: color,
              border: Border.all(color: Colors.black, width: 4),
            ),
            child: child,
          ),
        ],
      ),
    );
  }
}
