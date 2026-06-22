import 'dart:math';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'budget_models.dart';

class FinancialHealth {
  final double score;
  final double adherenceScore;
  final double savingsScore;
  final double consistencyScore;
  final double stabilityScore;

  FinancialHealth({
    required this.score,
    required this.adherenceScore,
    required this.savingsScore,
    required this.consistencyScore,
    required this.stabilityScore,
  });
}

FinancialHealth calculateHealthScore(List<Budget> history) {
  if (history.isEmpty) {
    return FinancialHealth(score: 0, adherenceScore: 0, savingsScore: 0, consistencyScore: 0, stabilityScore: 0);
  }

  Budget current = history.last;

  double adherenceScore = 100.0;
  if (current.totalBudget > 0) {
    double spentRatio = current.totalSpent / current.totalBudget;
    if (spentRatio > 1.0) {
      adherenceScore = max(0.0, 100.0 - ((spentRatio - 1.0) * 100.0));
    } else {
      adherenceScore = 100.0;
    }
  }

  double savingsScore = 50.0;
  if (current.totalIncome > 0) {
    double savingsRate = (current.totalIncome - current.totalSpent) / current.totalIncome;
    if (savingsRate >= 0.2) {
      savingsScore = 100.0;
    } else if (savingsRate >= 0) {
      savingsScore = 50.0 + (savingsRate / 0.2) * 50.0;
    } else {
      savingsScore = max(0.0, 50.0 + (savingsRate * 100.0));
    }
  }

  double consistencyScore = 100.0;
  if (history.length >= 2) {
    double avgSpent = history.map((b) => b.totalSpent).reduce((a, b) => a + b) / history.length;
    double variance = history.map((b) => pow(b.totalSpent - avgSpent, 2)).reduce((a, b) => a + b) / history.length;
    double stdDev = sqrt(variance);
    if (avgSpent > 0) {
      double cv = stdDev / avgSpent;
      consistencyScore = max(0.0, 100.0 - (cv * 100.0));
    }
  }

  double stabilityScore = 100.0;
  if (history.length >= 2) {
    double avgIncome = history.map((b) => b.totalIncome).reduce((a, b) => a + b) / history.length;
    double variance = history.map((b) => pow(b.totalIncome - avgIncome, 2)).reduce((a, b) => a + b) / history.length;
    double stdDev = sqrt(variance);
    if (avgIncome > 0) {
      double cv = stdDev / avgIncome;
      stabilityScore = max(0.0, 100.0 - (cv * 100.0));
    }
  }

  double finalScore = (adherenceScore * 0.3) + (savingsScore * 0.3) + (consistencyScore * 0.2) + (stabilityScore * 0.2);

  return FinancialHealth(
    score: finalScore,
    adherenceScore: adherenceScore,
    savingsScore: savingsScore,
    consistencyScore: consistencyScore,
    stabilityScore: stabilityScore,
  );
}

class FinancialHealthPage extends StatefulWidget {
  const FinancialHealthPage({Key? key}) : super(key: key);

  @override
  State<FinancialHealthPage> createState() => _FinancialHealthPageState();
}

class _FinancialHealthPageState extends State<FinancialHealthPage> {
  // Mock data for demonstration since we don't have real DB fetching logic here yet
  List<Budget> mockHistory = [
    Budget(id: '1', month: 4, year: 2026, totalBudget: 4000, totalSpent: 3800, totalIncome: 5000, categories: {}),
    Budget(id: '2', month: 5, year: 2026, totalBudget: 4000, totalSpent: 4100, totalIncome: 5100, categories: {}),
    Budget(id: '3', month: 6, year: 2026, totalBudget: 4000, totalSpent: 3500, totalIncome: 5000, categories: {}),
  ];

  late FinancialHealth health;

  @override
  void initState() {
    super.initState();
    health = calculateHealthScore(mockHistory);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          'HEALTH METRIC',
          style: GoogleFonts.robotoMono(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildScoreCard(),
            const SizedBox(height: 24),
            _buildRadarChart(),
            const SizedBox(height: 24),
            _buildFactorBars(),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreCard() {
    Color accentColor = health.score >= 70 ? const Color(0xFF00FF00) : Colors.redAccent;
    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: Colors.black, width: 4),
      ),
      padding: const EdgeInsets.symmetric(vertical: 32.0, horizontal: 16.0),
      child: Column(
        children: [
          Text(
            'SYS.SCORE',
            style: GoogleFonts.robotoMono(
              color: Colors.white,
              fontSize: 16,
              letterSpacing: 4.0,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            health.score.toStringAsFixed(0),
            style: GoogleFonts.robotoMono(
              color: accentColor,
              fontSize: 120,
              height: 1.0,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRadarChart() {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
      ),
      padding: const EdgeInsets.all(16.0),
      child: RadarChart(
        RadarChartData(
          dataSets: [
            RadarDataSet(
              dataEntries: [
                RadarEntry(value: health.adherenceScore),
                RadarEntry(value: health.savingsScore),
                RadarEntry(value: health.consistencyScore),
                RadarEntry(value: health.stabilityScore),
              ],
              fillColor: const Color(0xFF00FF00).withOpacity(0.5),
              borderColor: Colors.black,
              borderWidth: 3,
              entryRadius: 0,
            ),
          ],
          radarBackgroundColor: Colors.transparent,
          borderData: FlBorderData(show: false),
          radarBorderData: const BorderSide(color: Colors.black, width: 2),
          titlePositionPercentageOffset: 0.2,
          titleTextStyle: GoogleFonts.robotoMono(
            color: Colors.black,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
          getTitle: (index, angle) {
            switch (index) {
              case 0:
                return const RadarChartTitle(text: 'ADHERENCE');
              case 1:
                return const RadarChartTitle(text: 'SAVINGS');
              case 2:
                return const RadarChartTitle(text: 'CONSISTENCY');
              case 3:
                return const RadarChartTitle(text: 'STABILITY');
              default:
                return const RadarChartTitle(text: '');
            }
          },
          tickCount: 4,
          ticksTextStyle: const TextStyle(color: Colors.transparent),
          tickBorderData: const BorderSide(color: Colors.black, width: 1),
          gridBorderData: const BorderSide(color: Colors.black, width: 1),
        ),
      ),
    );
  }

  Widget _buildFactorBars() {
    return Column(
      children: [
        _buildProgressBar('BUDGET ADHERENCE', health.adherenceScore),
        const SizedBox(height: 16),
        _buildProgressBar('SAVINGS RATE', health.savingsScore),
        const SizedBox(height: 16),
        _buildProgressBar('SPENDING CONSISTENCY', health.consistencyScore),
        const SizedBox(height: 16),
        _buildProgressBar('INCOME STABILITY', health.stabilityScore),
      ],
    );
  }

  Widget _buildProgressBar(String label, double score) {
    int totalBlocks = 10;
    int filledBlocks = (score / 10).round();

    String barString = '';
    for (int i = 0; i < totalBlocks; i++) {
      if (i < filledBlocks) {
        barString += '█';
      } else {
        barString += '░';
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: GoogleFonts.robotoMono(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.black, width: 2),
            color: Colors.white,
          ),
          padding: const EdgeInsets.all(8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '[$barString]',
                style: GoogleFonts.robotoMono(
                  color: Colors.black,
                  fontSize: 18,
                  letterSpacing: 2,
                ),
              ),
              Text(
                '${score.toStringAsFixed(0)}%',
                style: GoogleFonts.robotoMono(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
