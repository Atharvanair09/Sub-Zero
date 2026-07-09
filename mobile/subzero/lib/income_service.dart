import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'income_models.dart';

class IncomeService extends ChangeNotifier {
  static final IncomeService instance = IncomeService._internal();

  IncomeService._internal() {
    _loadData();
  }

  List<IncomeSource> _incomeSources = [];
  List<IncomeMatch> _pendingMatches = [];

  List<IncomeSource> get incomeSources => _incomeSources;
  List<IncomeMatch> get pendingMatches => _pendingMatches;

  static const String _sourcesKey = 'income_sources_v1';
  static const String _matchesKey = 'income_matches_v1';

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Load sources
    final sourcesJson = prefs.getStringList(_sourcesKey) ?? [];
    _incomeSources = sourcesJson
        .map((s) => IncomeSource.fromJson(jsonDecode(s)))
        .toList();

    // Load matches
    final matchesJson = prefs.getStringList(_matchesKey) ?? [];
    _pendingMatches = matchesJson
        .map((m) => IncomeMatch.fromJson(jsonDecode(m)))
        .toList();

    notifyListeners();
  }

  Future<void> _saveData() async {
    final prefs = await SharedPreferences.getInstance();
    
    final sourcesJson = _incomeSources.map((s) => jsonEncode(s.toJson())).toList();
    await prefs.setStringList(_sourcesKey, sourcesJson);

    final matchesJson = _pendingMatches.map((m) => jsonEncode(m.toJson())).toList();
    await prefs.setStringList(_matchesKey, matchesJson);
    
    notifyListeners();
  }

  Future<void> addIncomeSource(IncomeSource source) async {
    _incomeSources.add(source);
    await _saveData();
  }

  Future<void> updateIncomeSource(IncomeSource updatedSource) async {
    final index = _incomeSources.indexWhere((s) => s.id == updatedSource.id);
    if (index != -1) {
      _incomeSources[index] = updatedSource;
      await _saveData();
    }
  }

  Future<void> deleteIncomeSource(String id) async {
    _incomeSources.removeWhere((s) => s.id == id);
    _pendingMatches.removeWhere((m) => m.incomeSourceId == id);
    await _saveData();
  }

  /// Processes new transactions to see if they match any income source.
  /// Unmatched transactions are returned to be processed as normal credits.
  Future<List<Map<String, dynamic>>> matchNewTransactions(List<Map<String, dynamic>> newTransactions) async {
    List<Map<String, dynamic>> unmatched = [];
    bool hasNewMatches = false;

    for (var tx in newTransactions) {
      String id = tx['_id']?.toString() ?? '';
      if (id.isEmpty) {
        unmatched.add(tx);
        continue;
      }

      String type = (tx['type'] as String?)?.toLowerCase() ?? 'debit';
      if (type != 'credit') {
        unmatched.add(tx);
        continue;
      }

      // Check if already matched
      if (_pendingMatches.any((m) => m.transactionId == id) ||
          _incomeSources.any((s) => s.linkedTransactionIds.contains(id))) {
        continue; // Already processed
      }

      double amount = (tx['amount'] as num?)?.toDouble() ?? 0.0;
      String sender = (tx['name'] as String?) ?? '';

      // Find an exact match for Sender and Amount
      IncomeSource? matchedSource;
      try {
        matchedSource = _incomeSources.firstWhere(
          (s) => s.isActive &&
                 s.sender.toLowerCase() == sender.toLowerCase() &&
                 (s.expectedAmount - amount).abs() < 0.01,
        );
      } catch (e) {
        matchedSource = null;
      }

      if (matchedSource != null) {
        _pendingMatches.add(IncomeMatch(
          transactionId: id,
          incomeSourceId: matchedSource.id,
          transactionData: tx,
        ));
        hasNewMatches = true;
      } else {
        unmatched.add(tx);
      }
    }

    if (hasNewMatches) {
      await _saveData();
    }

    return unmatched;
  }

  Future<void> confirmMatch(String transactionId) async {
    final matchIndex = _pendingMatches.indexWhere((m) => m.transactionId == transactionId);
    if (matchIndex != -1) {
      final match = _pendingMatches[matchIndex];
      final sourceIndex = _incomeSources.indexWhere((s) => s.id == match.incomeSourceId);
      
      if (sourceIndex != -1) {
        final source = _incomeSources[sourceIndex];
        final updatedIds = List<String>.from(source.linkedTransactionIds)..add(transactionId);
        
        DateTime? receivedDate;
        if (match.transactionData['date'] != null) {
          receivedDate = DateTime.tryParse(match.transactionData['date']);
        }
        receivedDate ??= DateTime.now();

        _incomeSources[sourceIndex] = source.copyWith(
          linkedTransactionIds: updatedIds,
          lastReceivedDate: receivedDate,
        );
      }
      
      _pendingMatches.removeAt(matchIndex);
      await _saveData();
    }
  }

  Future<void> rejectMatch(String transactionId) async {
    _pendingMatches.removeWhere((m) => m.transactionId == transactionId);
    await _saveData();
  }
}
