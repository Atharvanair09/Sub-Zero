import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const SplashScreen({super.key, required this.onComplete});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  // Scene 1: SPEND.
  late final Animation<double> _spendOpacity;
  late final Animation<double> _spendScale;
  late final Animation<double> _spendSlideOut;

  // Scene 2: SAVE.
  late final Animation<double> _saveOpacity;
  late final Animation<double> _saveSlideIn;
  late final Animation<double> _saveSlideOut;

  // Scene 3: GROW.
  late final Animation<double> _growOpacity;
  late final Animation<double> _growSlideIn;
  late final Animation<double> _growSlideOut;

  // Scene 4: Brutalist Blocks Slide & Collide
  late final Animation<double> _blocksCollisionProgress;

  // Scene 5: Blocks Retract & Logo Reveal
  late final Animation<double> _blocksRetractProgress;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _logoScale;

  // Scene 6: Thick Border & Logo Scale-in
  late final Animation<double> _borderWidth;
  late final Animation<double> _logoFinalScale;

  // Scene 7: Exit Transition
  late final Animation<double> _exitOpacity;

  @override
  void initState() {
    super.initState();

    // Total duration: 5.5 seconds (5000ms sequence + 500ms exit fade)
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 5500),
    );

    // We split 0.0 to 1.0 (5500ms total) into precise intervals:
    // 0ms - 1000ms: Scene 1 (t = 0.0 to 0.1818)
    // 1000ms - 2000ms: Scene 2 (t = 0.1818 to 0.3636)
    // 2000ms - 3000ms: Scene 3 (t = 0.3636 to 0.5455)
    // 3000ms - 3800ms: Scene 4 (t = 0.5455 to 0.6909)
    // 3800ms - 4400ms: Scene 5 (t = 0.6909 to 0.8000)
    // 4400ms - 5000ms: Scene 6 (t = 0.8000 to 0.9091)
    // 5000ms - 5500ms: Scene 7 Exit (t = 0.9091 to 1.0)

    // Scene 1: "SPEND."
    // Enters from 0ms to 200ms (t: 0.0 -> 0.0364)
    _spendOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.0364, curve: Curves.easeOut),
      ),
    );
    _spendScale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.0364, curve: Curves.easeOut),
      ),
    );
    // Exits from 1000ms to 1200ms (t: 0.1818 -> 0.2182)
    _spendSlideOut = Tween<double>(begin: 0.0, end: -100.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.1818, 0.2182, curve: Curves.easeIn),
      ),
    );

    // Scene 2: "SAVE."
    // Enters from 1000ms to 1200ms (t: 0.1818 -> 0.2182)
    _saveOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.1818, 0.2182, curve: Curves.easeOut),
      ),
    );
    _saveSlideIn = Tween<double>(begin: 100.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.1818, 0.2182, curve: Curves.easeOut),
      ),
    );
    // Exits from 2000ms to 2200ms (t: 0.3636 -> 0.4000)
    _saveSlideOut = Tween<double>(begin: 0.0, end: -100.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.3636, 0.4000, curve: Curves.easeIn),
      ),
    );

    // Scene 3: "GROW."
    // Enters from 2000ms to 2200ms (t: 0.3636 -> 0.4000)
    _growOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.3636, 0.4000, curve: Curves.easeOut),
      ),
    );
    _growSlideIn = Tween<double>(begin: 100.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.3636, 0.4000, curve: Curves.easeOut),
      ),
    );
    // Exits from 3000ms to 3200ms (t: 0.5455 -> 0.5818)
    _growSlideOut = Tween<double>(begin: 0.0, end: -100.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5455, 0.5818, curve: Curves.easeIn),
      ),
    );

    // Scene 4: Colored blocks slide and collide (3000ms - 3800ms, t: 0.5455 -> 0.6909)
    // We use easeOutBack for a mechanical, solid impact curve
    _blocksCollisionProgress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5455, 0.6909, curve: Curves.easeOutBack),
      ),
    );

    // Scene 5: Blocks retract (3800ms - 4300ms, t: 0.6909 -> 0.7818)
    _blocksRetractProgress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.6909, 0.7818, curve: Curves.easeInOut),
      ),
    );
    // Logo reveals (3900ms - 4400ms, t: 0.7091 -> 0.8000)
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.7091, 0.8000, curve: Curves.easeOut),
      ),
    );
    _logoScale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.7091, 0.8000, curve: Curves.easeOutBack),
      ),
    );

    // Scene 6: Thick border animates + logo scale-in (4400ms - 4700ms, t: 0.8000 -> 0.8545)
    _borderWidth = Tween<double>(begin: 0.0, end: 16.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.8000, 0.8545, curve: Curves.easeInOut),
      ),
    );
    _logoFinalScale = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.8000, 0.8545, curve: Curves.easeInOut),
      ),
    );

    // Scene 7: Exit transition fade-out (5000ms - 5500ms, t: 0.9091 -> 1.0)
    _exitOpacity = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.9091, 1.0, curve: Curves.easeIn),
      ),
    );

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onComplete();
      }
    });

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width;
    final screenHeight = size.height;

    // Grid details for Scene 4 & 5
    const double blockSize = 130.0;
    final double centerLeftX = (screenWidth / 2) - blockSize;
    final double centerRightX = (screenWidth / 2);
    final double centerTopY = (screenHeight / 2) - blockSize;
    final double centerBottomY = (screenHeight / 2);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final exitOpacityVal = _exitOpacity.value;

        // Skip calculations and render nothing if fully exited
        if (exitOpacityVal <= 0.0) {
          return const SizedBox.shrink();
        }

        return Positioned.fill(
          child: Opacity(
            opacity: exitOpacityVal,
            child: Stack(
              children: [
                // 1. Full Screen Background
                Container(
                  color: const Color(0xFFF8F7F4),
                ),

                // 2. Scene 1 Text: "SPEND."
                if (_controller.value < 0.2182)
                  Center(
                    child: Opacity(
                      opacity: _spendOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _spendSlideOut.value),
                        child: Transform.scale(
                          scale: _spendScale.value,
                          child: Text(
                            'SPEND.',
                            style: GoogleFonts.spaceGrotesk(
                              color: const Color(0xFF111111),
                              fontSize: 80,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -2.0,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                // 3. Scene 2 Text: "SAVE."
                if (_controller.value >= 0.1818 && _controller.value < 0.4000)
                  Center(
                    child: Opacity(
                      opacity: _saveOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _saveSlideIn.value + _saveSlideOut.value),
                        child: Text(
                          'SAVE.',
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFF111111),
                            fontSize: 80,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -2.0,
                          ),
                        ),
                      ),
                    ),
                  ),

                // 4. Scene 3 Text: "GROW."
                if (_controller.value >= 0.3636 && _controller.value < 0.5818)
                  Center(
                    child: Opacity(
                      opacity: _growOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _growSlideIn.value + _growSlideOut.value),
                        child: Text(
                          'GROW.',
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFF111111),
                            fontSize: 80,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -2.0,
                          ),
                        ),
                      ),
                    ),
                  ),

                // 5. Scene 4 & 5: Colored Brutalist Blocks
                if (_controller.value >= 0.5455 && _controller.value < 0.8000) ...[
                  // Electric Blue (Top-Left)
                  // Slide: Left (-blockSize to centerLeftX)
                  // Retract: Top-Left (-retract, -retract) & Scale down & Fade
                  _buildBrutalistBlock(
                    color: const Color(0xFF2962FF),
                    startX: -blockSize - 100,
                    startY: centerTopY,
                    endX: centerLeftX,
                    endY: centerTopY,
                    retractOffsetX: -40,
                    retractOffsetY: -40,
                    collisionProgress: _blocksCollisionProgress.value,
                    retractProgress: _blocksRetractProgress.value,
                    size: blockSize,
                  ),

                  // Lime Green (Top-Right)
                  // Slide: Right (screenWidth to centerRightX)
                  // Retract: Top-Right (retract, -retract)
                  _buildBrutalistBlock(
                    color: const Color(0xFFB2FF05),
                    startX: screenWidth + 100,
                    startY: centerTopY,
                    endX: centerRightX,
                    endY: centerTopY,
                    retractOffsetX: 40,
                    retractOffsetY: -40,
                    collisionProgress: _blocksCollisionProgress.value,
                    retractProgress: _blocksRetractProgress.value,
                    size: blockSize,
                  ),

                  // Bright Yellow (Bottom-Left)
                  // Slide: Top (-blockSize to centerTopY, wait, let's slide from Top: Y = -blockSize to centerBottomY)
                  // Retract: Bottom-Left (-retract, retract)
                  _buildBrutalistBlock(
                    color: const Color(0xFFFFD600),
                    startX: centerLeftX,
                    startY: -blockSize - 100,
                    endX: centerLeftX,
                    endY: centerBottomY,
                    retractOffsetX: -40,
                    retractOffsetY: 40,
                    collisionProgress: _blocksCollisionProgress.value,
                    retractProgress: _blocksRetractProgress.value,
                    size: blockSize,
                  ),

                  // Coral Red (Bottom-Right)
                  // Slide: Bottom (screenHeight to centerBottomY)
                  // Retract: Bottom-Right (retract, retract)
                  _buildBrutalistBlock(
                    color: const Color(0xFFFF4B4B),
                    startX: centerRightX,
                    startY: screenHeight + 100,
                    endX: centerRightX,
                    endY: centerBottomY,
                    retractOffsetX: 40,
                    retractOffsetY: 40,
                    collisionProgress: _blocksCollisionProgress.value,
                    retractProgress: _blocksRetractProgress.value,
                    size: blockSize,
                  ),
                ],

                // 6. Scene 5 & 6 Logo Reveal
                if (_controller.value >= 0.7091)
                  Center(
                    child: Opacity(
                      opacity: _logoOpacity.value,
                      child: Transform.scale(
                        scale: _logoScale.value * _logoFinalScale.value,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'SUB-ZERO',
                              style: GoogleFonts.spaceGrotesk(
                                color: const Color(0xFF111111),
                                fontSize: 76,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -2.0,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Your Money Buddy',
                              style: GoogleFonts.spaceGrotesk(
                                color: const Color(0xFF111111),
                                fontSize: 30,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                // 7. Thick Black Border Animating Around Screen
                if (_controller.value >= 0.8000)
                  Positioned.fill(
                    child: IgnorePointer(
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: const Color(0xFF000000),
                            width: _borderWidth.value,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBrutalistBlock({
    required Color color,
    required double startX,
    required double startY,
    required double endX,
    required double endY,
    required double retractOffsetX,
    required double retractOffsetY,
    required double collisionProgress,
    required double retractProgress,
    required double size,
  }) {
    // Current collision position
    final currentCollisionX = startX + (endX - startX) * collisionProgress;
    final currentCollisionY = startY + (endY - startY) * collisionProgress;

    // Current retraction offset
    final currentRetractX = retractOffsetX * retractProgress;
    final currentRetractY = retractOffsetY * retractProgress;

    // Final position combines collision and retraction
    final posX = currentCollisionX + currentRetractX;
    final posY = currentCollisionY + currentRetractY;

    // Scale down during retraction
    final scale = 1.0 - (0.25 * retractProgress);

    // Fade out during retraction
    final opacity = (1.0 - retractProgress).clamp(0.0, 1.0);

    if (opacity <= 0.0) return const SizedBox.shrink();

    return Positioned(
      left: posX,
      top: posY,
      child: Opacity(
        opacity: opacity,
        child: Transform.scale(
          scale: scale,
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: color,
              border: Border.all(color: Colors.black, width: 3.5),
            ),
          ),
        ),
      ),
    );
  }
}
