import 'dart:math';
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

  late final Animation<double> _scrollIndex;
  late final Animation<double> _settleOffset;
  late final Animation<double> _surroundingOpacity;
  late final Animation<double> _growScale;

  late final Animation<double> _blocksCollision;
  late final Animation<double> _blocksRetract;

  late final Animation<double> _morphFlip;
  late final Animation<double> _borderProgress;
  late final Animation<double> _logoEmphasis;
  late final Animation<double> _exitOpacity;

  final List<String> words = [
    "INCOME.", "TRACK.", "PLAN.", "BUDGET.", "BUILD.", "TRAVEL.", "SHOP.", "LEARN.", "INVEST.", "ASSETS.", 
    "SPEND.", // Index 10
    "EXPENSE.", "WEALTH.", "EQUITY.", "PROFIT.", "START.", "FREEDOM.", "FUTURE.", "OPTIONS.", "GOALS.",
    "SAVE.", // Index 20
    "COMPOUND.", "DIVIDEND.", "CAPITAL.", "MARKET.", "FUNDS.", "STOCKS.", "BONDS.", "CASH.", "VALUE.",
    "GROW.", // Index 30
    "VISION.", "LEGACY.", "EMPIRE.", "SUCCESS.", "FORTUNE."
  ];

  @override
  void initState() {
    super.initState();

    // Total duration: 9550ms
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 9550),
    );

    // Timeline mapping: weights correspond exactly to milliseconds
    _scrollIndex = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 900),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 10.0).chain(CurveTween(curve: Curves.easeInOutQuart)), weight: 1200),
      TweenSequenceItem(tween: ConstantTween(10.0), weight: 900),
      TweenSequenceItem(tween: Tween(begin: 10.0, end: 20.0).chain(CurveTween(curve: Curves.easeInOutQuart)), weight: 1200),
      TweenSequenceItem(tween: ConstantTween(20.0), weight: 900),
      TweenSequenceItem(tween: Tween(begin: 20.0, end: 30.0).chain(CurveTween(curve: Curves.easeInOutQuart)), weight: 1200),
      TweenSequenceItem(tween: ConstantTween(30.0), weight: 3250),
    ]).animate(_controller);

    // Mechanical settle 4px down and back up at each stop
    _settleOffset = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 2100),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 4.0).chain(CurveTween(curve: Curves.easeOut)), weight: 150),
      TweenSequenceItem(tween: Tween(begin: 4.0, end: 0.0).chain(CurveTween(curve: Curves.easeIn)), weight: 150),
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 1800),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 4.0).chain(CurveTween(curve: Curves.easeOut)), weight: 150),
      TweenSequenceItem(tween: Tween(begin: 4.0, end: 0.0).chain(CurveTween(curve: Curves.easeIn)), weight: 150),
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 1800),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 4.0).chain(CurveTween(curve: Curves.easeOut)), weight: 150),
      TweenSequenceItem(tween: Tween(begin: 4.0, end: 0.0).chain(CurveTween(curve: Curves.easeIn)), weight: 150),
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 2950),
    ]).animate(_controller);

    // Fade out surrounding words when GROW. is centered
    _surroundingOpacity = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 6300),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeOut)), weight: 450),
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 2800),
    ]).animate(_controller);

    // Scale down GROW. slightly before morph
    _growScale = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 6300),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.95).chain(CurveTween(curve: Curves.easeOut)), weight: 450),
      TweenSequenceItem(tween: ConstantTween(0.95), weight: 2800),
    ]).animate(_controller);

    // Brutalist blocks slide in
    _blocksCollision = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 6750),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeOutExpo)), weight: 450),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 2350),
    ]).animate(_controller);

    // Brutalist blocks retract
    _blocksRetract = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 7200),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeOutExpo)), weight: 450),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 1900),
    ]).animate(_controller);

    // Split-flap morph effect: 0.0 to 1.0 is GROW flipping out. 1.0 to 2.0 is SUB-ZERO flipping in.
    _morphFlip = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 7200),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeIn)), weight: 225),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 2.0).chain(CurveTween(curve: Curves.easeOut)), weight: 225),
      TweenSequenceItem(tween: ConstantTween(2.0), weight: 1900),
    ]).animate(_controller);

    // Border draws clockwise around the screen
    _borderProgress = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(0.0), weight: 7650),
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeInOutCubic)), weight: 450),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 1450),
    ]).animate(_controller);

    // Final subtle scale bump for the logo
    _logoEmphasis = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 7650),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.03).chain(CurveTween(curve: Curves.easeOut)), weight: 225),
      TweenSequenceItem(tween: Tween(begin: 1.03, end: 1.0).chain(CurveTween(curve: Curves.easeIn)), weight: 225),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 1450),
    ]).animate(_controller);

    // Exit transition to main app
    _exitOpacity = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 9100),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeOut)), weight: 450),
    ]).animate(_controller);

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

  Widget _buildBrutalistBlock({
    required Color color,
    required double startX,
    required double startY,
    required double targetOffsetX,
    required double targetOffsetY,
    required double retractOffsetX,
    required double retractOffsetY,
    required double screenWidth,
    required double screenHeight,
  }) {
    final colProg = _blocksCollision.value;
    final retProg = _blocksRetract.value;

    if (colProg == 0.0 && retProg == 0.0) return const SizedBox.shrink();
    if (retProg == 1.0) return const SizedBox.shrink(); // fully retracted and gone

    final centerX = screenWidth / 2;
    final centerY = screenHeight / 2;

    final targetX = centerX + targetOffsetX;
    final targetY = centerY + targetOffsetY;

    // Interpolate collision (slide in)
    final colX = startX + (targetX - startX) * colProg;
    final colY = startY + (targetY - startY) * colProg;

    // Interpolate retraction (blast out)
    final posX = colX + (retractOffsetX * retProg);
    final posY = colY + (retractOffsetY * retProg);

    // Scale down and fade during retract
    final scale = 1.0 - (0.4 * retProg);
    final opacity = (1.0 - retProg).clamp(0.0, 1.0);

    return Positioned(
      left: posX - 60, // 120 size, so 60 is center offset
      top: posY - 60,
      child: Opacity(
        opacity: opacity,
        child: Transform.scale(
          scale: scale,
          child: Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: color,
              border: Border.all(color: const Color(0xFF000000), width: 4.0),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final exitOpacity = _exitOpacity.value;
        if (exitOpacity <= 0.0) return const SizedBox.shrink();

        return Opacity(
          opacity: exitOpacity,
          child: Scaffold(
            backgroundColor: const Color(0xFFF8F7F4),
            body: SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final screenWidth = constraints.maxWidth;
                  final screenHeight = constraints.maxHeight;
                  
                  // Settings for the mechanical wheel
                  const double itemHeight = 100.0;
                  final currentIndex = _scrollIndex.value;

                  return Stack(
                    children: [
                      // 1. The Continuous Mechanical Wheel
                      Align(
                        alignment: Alignment.center,
                        child: ClipRect(
                          child: SizedBox(
                            height: screenHeight,
                            width: double.infinity,
                            child: OverflowBox(
                              maxHeight: double.infinity,
                              alignment: Alignment.topCenter,
                              child: Transform.translate(
                                // Calculate exact offset to center the `currentIndex`
                                offset: Offset(0, (screenHeight / 2) - (currentIndex * itemHeight) - (itemHeight / 2) + _settleOffset.value),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: words.asMap().entries.map((entry) {
                                    final index = entry.key;
                                    final word = entry.value;

                                    // The distance from the center (currentIndex)
                                    final double dist = (currentIndex - index).abs();
                                    
                                    // Only highlight the exact words we stop on (INCOME, SPEND, SAVE, GROW)
                                    // Intermediate words stay static to prevent high-speed flashing and visual jank
                                    final bool isTargetStop = index == 0 || index == 10 || index == 20 || index == 30;
                                    final double centerFactor = isTargetStop ? (1.0 - dist).clamp(0.0, 1.0) : 0.0;

                                    // Base text properties
                                    Color wordColor = Color.lerp(
                                      const Color(0xFF999999).withOpacity(0.4), // light gray / low opacity
                                      const Color(0xFF111111), // pure black
                                      centerFactor,
                                    )!;
                                    
                                    // Keep font weight constant to avoid synthetic bold layout jitter
                                    const FontWeight wordWeight = FontWeight.normal;
                                    
                                    // Slightly larger when centered
                                    double scale = 1.0 + (0.15 * centerFactor); // 1.0 to 1.15
                                    
                                    // Opacity from 0.4 to 1.0
                                    double opacity = 0.4 + (0.6 * centerFactor);

                                    // Hide surrounding words at the end
                                    if (index != 30) {
                                      opacity *= _surroundingOpacity.value;
                                    } else {
                                      // This is GROW. Scale it down before morph.
                                      scale *= _growScale.value;
                                      // Hide the reel's GROW completely once morphing starts
                                      // because the standalone morph widget takes over.
                                      if (_morphFlip.value > 0.0) {
                                        opacity = 0.0;
                                      }
                                    }

                                    final bebasStyle = GoogleFonts.bebasNeue(
                                      color: wordColor,
                                      fontSize: 80,
                                      fontWeight: wordWeight,
                                      height: 1.0,
                                      letterSpacing: 2.0,
                                    );

                                    return Container(
                                      height: itemHeight,
                                      alignment: Alignment.center,
                                      child: Opacity(
                                        opacity: opacity,
                                        child: Transform.scale(
                                          scale: scale,
                                          child: Text(word, style: bebasStyle),
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // 1.5 Arrow Overlay
                      if (_surroundingOpacity.value > 0.0)
                        Center(
                          child: Opacity(
                            opacity: _surroundingOpacity.value,
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 380),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: const [
                                    Icon(Icons.play_arrow, size: 40, color: Colors.black),
                                    RotatedBox(
                                      quarterTurns: 2,
                                      child: Icon(Icons.play_arrow, size: 40, color: Colors.black),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                      // 2. Standalone Morphing Widget (GROW. -> SUB-ZERO)
                      if (_morphFlip.value > 0.0)
                        Center(
                          child: Transform.scale(
                            scale: (1.15 * _growScale.value) * _logoEmphasis.value,
                            child: Transform(
                              alignment: Alignment.center,
                              transform: Matrix4.identity()
                                ..setEntry(3, 2, 0.001) // perspective
                                ..rotateX(_morphFlip.value < 1.0 
                                    ? _morphFlip.value * (pi / 2) 
                                    : (_morphFlip.value - 2.0) * (pi / 2)),
                              child: Stack(
                                clipBehavior: Clip.none,
                                alignment: Alignment.center,
                                children: [
                                  SizedBox(
                                    height: itemHeight,
                                    child: Center(
                                      child: Text(
                                        _morphFlip.value < 1.0 ? "GROW." : "SUB-ZERO",
                                        style: GoogleFonts.bebasNeue(
                                          color: const Color(0xFF111111),
                                          fontSize: 80,
                                          fontWeight: FontWeight.bold,
                                          height: 1.0,
                                          letterSpacing: 2.0,
                                        ),
                                      ),
                                    ),
                                  ),
                                  if (_morphFlip.value >= 1.0)
                                    Positioned(
                                      top: itemHeight - 10,
                                      child: Text(
                                        "Your Money Buddy",
                                        style: GoogleFonts.inter(
                                          color: const Color(0xFF111111),
                                          fontSize: 24,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        ),

                      // 3. Brutalist Blocks Sliding In/Out
                      if (_blocksCollision.value > 0.0) ...[
                        _buildBrutalistBlock(
                          color: const Color(0xFF2563EB), // Electric Blue
                          startX: -200, startY: -200,
                          targetOffsetX: -110, targetOffsetY: -90,
                          retractOffsetX: -100, retractOffsetY: -100,
                          screenWidth: screenWidth, screenHeight: screenHeight,
                        ),
                        _buildBrutalistBlock(
                          color: const Color(0xFFA3E635), // Lime Green
                          startX: screenWidth + 200, startY: -200,
                          targetOffsetX: 110, targetOffsetY: -90,
                          retractOffsetX: 100, retractOffsetY: -100,
                          screenWidth: screenWidth, screenHeight: screenHeight,
                        ),
                        _buildBrutalistBlock(
                          color: const Color(0xFFFACC15), // Bright Yellow
                          startX: -200, startY: screenHeight + 200,
                          targetOffsetX: -110, targetOffsetY: 90,
                          retractOffsetX: -100, retractOffsetY: 100,
                          screenWidth: screenWidth, screenHeight: screenHeight,
                        ),
                        _buildBrutalistBlock(
                          color: const Color(0xFFF87171), // Coral Red
                          startX: screenWidth + 200, startY: screenHeight + 200,
                          targetOffsetX: 110, targetOffsetY: 90,
                          retractOffsetX: 100, retractOffsetY: 100,
                          screenWidth: screenWidth, screenHeight: screenHeight,
                        ),
                      ],

                      // 4. Thick Black Border Drawing Clockwise
                      if (_borderProgress.value > 0.0)
                        Positioned.fill(
                          child: IgnorePointer(
                            child: CustomPaint(
                              painter: BorderPainter(_borderProgress.value),
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}

// Custom Painter to draw a 4px black border around the screen, progressing clockwise
class BorderPainter extends CustomPainter {
  final double progress;

  BorderPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0.0) return;

    final paint = Paint()
      ..color = const Color(0xFF000000)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8.0 // 4px border implies 8px stroke because it's centered on the edge (Wait, stroke is centered, so half is outside. Let's draw it inside the rect)
      ..strokeJoin = StrokeJoin.miter;

    final path = Path();
    final w = size.width;
    final h = size.height;
    
    // To ensure the 4px border is entirely visible and not clipped, we inset the rect by 2px.
    final double inset = 2.0;
    final double innerW = w - inset * 2;
    final double innerH = h - inset * 2;
    
    paint.strokeWidth = 4.0;

    final totalLength = (innerW * 2) + (innerH * 2);
    final currentLength = totalLength * progress;

    double drawnLength = 0.0;

    // Top edge (left to right)
    if (drawnLength < currentLength) {
      final drawDist = (currentLength - drawnLength).clamp(0.0, innerW);
      path.moveTo(inset, inset);
      path.lineTo(inset + drawDist, inset);
      drawnLength += innerW;
    }

    // Right edge (top to bottom)
    if (drawnLength < currentLength) {
      final drawDist = (currentLength - drawnLength).clamp(0.0, innerH);
      path.moveTo(w - inset, inset);
      path.lineTo(w - inset, inset + drawDist);
      drawnLength += innerH;
    }

    // Bottom edge (right to left)
    if (drawnLength < currentLength) {
      final drawDist = (currentLength - drawnLength).clamp(0.0, innerW);
      path.moveTo(w - inset, h - inset);
      path.lineTo(w - inset - drawDist, h - inset);
      drawnLength += innerW;
    }

    // Left edge (bottom to top)
    if (drawnLength < currentLength) {
      final drawDist = (currentLength - drawnLength).clamp(0.0, innerH);
      path.moveTo(inset, h - inset);
      path.lineTo(inset, h - inset - drawDist);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant BorderPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
