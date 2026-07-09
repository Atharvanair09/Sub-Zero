import 'dart:convert';

class IncomeSource {
  final String id;
  final String name;
  final String sender;
  final double expectedAmount;
  final String frequency; // Weekly, Monthly, Custom
  final DateTime? lastReceivedDate;
  final DateTime? nextExpectedDate;
  final List<String> linkedTransactionIds;
  final bool isActive;

  IncomeSource({
    required this.id,
    required this.name,
    required this.sender,
    required this.expectedAmount,
    required this.frequency,
    this.lastReceivedDate,
    this.nextExpectedDate,
    this.linkedTransactionIds = const [],
    this.isActive = true,
  });

  IncomeSource copyWith({
    String? id,
    String? name,
    String? sender,
    double? expectedAmount,
    String? frequency,
    DateTime? lastReceivedDate,
    DateTime? nextExpectedDate,
    List<String>? linkedTransactionIds,
    bool? isActive,
  }) {
    return IncomeSource(
      id: id ?? this.id,
      name: name ?? this.name,
      sender: sender ?? this.sender,
      expectedAmount: expectedAmount ?? this.expectedAmount,
      frequency: frequency ?? this.frequency,
      lastReceivedDate: lastReceivedDate ?? this.lastReceivedDate,
      nextExpectedDate: nextExpectedDate ?? this.nextExpectedDate,
      linkedTransactionIds: linkedTransactionIds ?? this.linkedTransactionIds,
      isActive: isActive ?? this.isActive,
    );
  }

  factory IncomeSource.fromJson(Map<String, dynamic> json) {
    return IncomeSource(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name'] as String? ?? '',
      sender: (json['expectedSender'] ?? json['sender'] ?? '').toString(),
      expectedAmount: ((json['amount'] ?? json['expectedAmount'] ?? 0) as num).toDouble(),
      frequency: (json['frequency'] as String?)?.toLowerCase() ?? 'monthly',
      lastReceivedDate: json['lastReceivedDate'] != null
          ? DateTime.tryParse(json['lastReceivedDate'] as String)
          : null,
      nextExpectedDate: json['nextExpectedDate'] != null
          ? DateTime.tryParse(json['nextExpectedDate'] as String)
          : null,
      linkedTransactionIds: List<String>.from(json['linkedTransactionIds'] ?? []),
      isActive: json['status'] != null ? (json['status'] == 'active') : (json['isActive'] as bool? ?? true),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty && id != 'new') 'id': id,
      'name': name,
      'expectedSender': sender,
      'amount': expectedAmount,
      'frequency': frequency,
      'lastReceivedDate': lastReceivedDate?.toIso8601String(),
      'nextExpectedDate': nextExpectedDate?.toIso8601String(),
      'linkedTransactionIds': linkedTransactionIds,
      'status': isActive ? 'active' : 'inactive',
    };
  }
}

class IncomeMatch {
  final String transactionId;
  final String incomeSourceId;
  final Map<String, dynamic> transactionData;
  final DateTime matchDate;

  IncomeMatch({
    required this.transactionId,
    required this.incomeSourceId,
    required this.transactionData,
    DateTime? matchDate,
  }) : matchDate = matchDate ?? DateTime.now();

  factory IncomeMatch.fromJson(Map<String, dynamic> json) {
    return IncomeMatch(
      transactionId: json['transactionId'] as String,
      incomeSourceId: json['incomeSourceId'] as String,
      transactionData: json['transactionData'] as Map<String, dynamic>? ?? {},
      matchDate: json['matchDate'] != null
          ? DateTime.parse(json['matchDate'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'transactionId': transactionId,
      'incomeSourceId': incomeSourceId,
      'transactionData': transactionData,
      'matchDate': matchDate.toIso8601String(),
    };
  }
}
