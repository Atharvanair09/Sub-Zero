class SavingsGoal {
  final String id;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final String priority;
  final String icon;

  SavingsGoal({
    required this.id,
    required this.name,
    required this.targetAmount,
    required this.currentAmount,
    required this.priority,
    required this.icon,
  });

  factory SavingsGoal.fromJson(Map<String, dynamic> json) {
    return SavingsGoal(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      targetAmount: (json['targetAmount'] ?? 0).toDouble(),
      currentAmount: (json['currentAmount'] ?? 0).toDouble(),
      priority: json['priority'] ?? 'medium',
      icon: json['icon'] ?? 'Savings',
    );
  }
}

class CategoryBudget {
  final String id;
  final String category;
  final double monthlyLimit;

  CategoryBudget({
    required this.id,
    required this.category,
    required this.monthlyLimit,
  });

  factory CategoryBudget.fromJson(Map<String, dynamic> json) {
    return CategoryBudget(
      id: json['_id'] ?? '',
      category: json['category'] ?? '',
      monthlyLimit: (json['monthlyLimit'] ?? 0).toDouble(),
    );
  }
}

class BudgetUtilization {
  final String category;
  final double limit;
  final double spent;
  final double percentage;

  BudgetUtilization({
    required this.category,
    required this.limit,
    required this.spent,
    required this.percentage,
  });

  factory BudgetUtilization.fromJson(Map<String, dynamic> json) {
    return BudgetUtilization(
      category: json['category'] ?? '',
      limit: (json['limit'] ?? 0).toDouble(),
      spent: (json['spent'] ?? 0).toDouble(),
      percentage: (json['percentage'] ?? 0).toDouble(),
    );
  }
}
