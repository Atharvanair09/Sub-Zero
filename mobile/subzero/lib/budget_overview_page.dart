import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'set_budget_page.dart';
import 'budget_models.dart';

class BudgetOverviewPage extends StatefulWidget {
  const BudgetOverviewPage({Key? key}) : super(key: key);

  @override
  _BudgetOverviewPageState createState() => _BudgetOverviewPageState();
}

class _BudgetOverviewPageState extends State<BudgetOverviewPage> {
  // Mock Data
  final Budget _budget = Budget(
    id: "2026-06",
    month: 6,
    year: 2026,
    totalBudget: 5000.0,
    totalSpent: 4200.0,
    totalIncome: 6000.0,
    categories: {
      "food": CategoryBudget(budget: 1000.0, spent: 850.0),
      "transport": CategoryBudget(budget: 500.0, spent: 500.0),
      "entertainment": CategoryBudget(budget: 1000.0, spent: 200.0),
    },
  );

  @override
  Widget build(BuildContext context) {
    final double percentage = _budget.totalSpent / _budget.totalBudget;
    final bool isWarning = percentage >= 0.8;
    final bool isCritical = percentage >= 1.0;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('BUDGET.', style: GoogleFonts.spaceMono(fontWeight: FontWeight.bold, color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const SetBudgetPage()));
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isCritical)
              Container(
                width: double.infinity,
                color: Colors.red,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 24),
                child: Text('BREACH: BUDGET EXCEEDED', style: GoogleFonts.spaceMono(color: Colors.white, fontWeight: FontWeight.bold)),
              )
            else if (isWarning)
              Container(
                width: double.infinity,
                color: Colors.amber,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 24),
                child: Text('WARNING: LIMIT APPROACHING', style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold)),
              ),
            Text('TOTAL MONTHLY', style: GoogleFonts.spaceMono(color: Colors.white54, fontSize: 16)),
            const SizedBox(height: 8),
            Text('\$${_budget.totalSpent} / \$${_budget.totalBudget}', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildProgressBar(percentage, isCritical ? Colors.red : (isWarning ? Colors.amber : Colors.white)),
            const SizedBox(height: 48),
            Text('CATEGORIES', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            ..._budget.categories.entries.map((e) => _buildCategoryRow(e.key, e.value)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryRow(String name, CategoryBudget cat) {
    final double percentage = cat.spent / cat.budget;
    final bool isCritical = percentage >= 1.0;
    final bool isWarning = percentage >= 0.8 && !isCritical;
    final Color barColor = isCritical ? Colors.red : (isWarning ? Colors.amber : Colors.white70);

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name.toUpperCase(), style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 16)),
              Text('\$${cat.spent} / \$${cat.budget}', style: GoogleFonts.spaceMono(color: Colors.white54, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 8),
          _buildProgressBar(percentage, barColor, height: 12),
        ],
      ),
    );
  }

  Widget _buildProgressBar(double percentage, Color color, {double height = 24}) {
    final safePercentage = percentage > 1.0 ? 1.0 : percentage;
    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white10,
        border: Border.all(color: Colors.white24),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: safePercentage,
        child: Container(color: color),
      ),
    );
  }
}
