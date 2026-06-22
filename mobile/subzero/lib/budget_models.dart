class Budget {
  final String id;
  final int month;
  final int year;
  final double totalBudget;
  final double totalSpent;
  final double totalIncome;
  final Map<String, CategoryBudget> categories;

  Budget({
    required this.id,
    required this.month,
    required this.year,
    required this.totalBudget,
    required this.totalSpent,
    required this.totalIncome,
    required this.categories,
  });

  factory Budget.fromJson(Map<String, dynamic> json) {
    var catMap = json['categories'] as Map<String, dynamic>? ?? {};
    Map<String, CategoryBudget> parsedCategories = {};
    catMap.forEach((key, value) {
      parsedCategories[key] = CategoryBudget.fromJson(value);
    });

    return Budget(
      id: json['budgetId'] ?? '',
      month: json['month'] ?? 1,
      year: json['year'] ?? 2026,
      totalBudget: (json['totalBudget'] ?? 0.0).toDouble(),
      totalSpent: (json['totalSpent'] ?? 0.0).toDouble(),
      totalIncome: (json['totalIncome'] ?? 0.0).toDouble(),
      categories: parsedCategories,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'budgetId': id,
      'month': month,
      'year': year,
      'totalBudget': totalBudget,
      'totalSpent': totalSpent,
      'totalIncome': totalIncome,
      'categories': categories.map((key, value) => MapEntry(key, value.toJson())),
    };
  }
}

class CategoryBudget {
  final double budget;
  final double spent;

  CategoryBudget({
    required this.budget,
    required this.spent,
  });

  factory CategoryBudget.fromJson(Map<String, dynamic> json) {
    return CategoryBudget(
      budget: (json['budget'] ?? 0.0).toDouble(),
      spent: (json['spent'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'budget': budget,
      'spent': spent,
    };
  }
}
