import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'income_models.dart';
import 'auth_service.dart';

class IncomeService extends ChangeNotifier {
  static final IncomeService instance = IncomeService._internal();

  IncomeService._internal() {
    _loadData();
  }

  List<IncomeSource> _incomeSources = [];
  List<IncomeMatch> _pendingMatches = [];

  List<IncomeSource> get incomeSources => _incomeSources;
  List<IncomeMatch> get pendingMatches => _pendingMatches;

  String _getBackendUrl() {
    if (kIsWeb) return 'http://localhost:5000';
    if (Platform.isAndroid) return 'http://10.0.2.2:5000';
    return 'http://localhost:5000';
  }

  Future<void> _loadData() async {
    final userId = AuthService.instance.userId;
    if (userId == null || userId.isEmpty) return;

    try {
      final response = await http.get(Uri.parse('${_getBackendUrl()}/api/cashflow/income-sources?userId=$userId'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _incomeSources = data.map((json) => IncomeSource.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading income sources: $e');
    }
  }

  Future<void> addIncomeSource(IncomeSource source) async {
    final userId = AuthService.instance.userId;
    if (userId == null || userId.isEmpty) return;

    try {
      final sourceJson = source.toJson();
      sourceJson['userId'] = userId;
      
      final response = await http.post(
        Uri.parse('${_getBackendUrl()}/api/cashflow/income-sources'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(sourceJson),
      );
      
      if (response.statusCode == 200) {
        await _loadData();
      } else {
        throw Exception(jsonDecode(response.body)['error'] ?? 'Server error');
      }
    } catch (e) {
      debugPrint('Error adding income source: $e');
      rethrow;
    }
  }

  Future<void> updateIncomeSource(IncomeSource updatedSource) async {
    try {
      final response = await http.put(
        Uri.parse('${_getBackendUrl()}/api/cashflow/income-sources/${updatedSource.id}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(updatedSource.toJson()),
      );
      
      if (response.statusCode == 200) {
        await _loadData();
      } else {
        throw Exception(jsonDecode(response.body)['error'] ?? 'Server error');
      }
    } catch (e) {
      debugPrint('Error updating income source: $e');
      rethrow;
    }
  }

  Future<void> deleteIncomeSource(String id) async {
    try {
      final response = await http.delete(
        Uri.parse('${_getBackendUrl()}/api/cashflow/income-sources/$id'),
      );
      
      if (response.statusCode == 200) {
        await _loadData();
      } else {
        throw Exception(jsonDecode(response.body)['error'] ?? 'Server error');
      }
    } catch (e) {
      debugPrint('Error deleting income source: $e');
      rethrow;
    }
  }

  /// Processes new transactions to see if they match any income source.
  /// Unmatched transactions are returned to be processed as normal credits.
  Future<List<Map<String, dynamic>>> matchNewTransactions(List<Map<String, dynamic>> newTransactions) async {
    // The backend natively processes this during gmail scan now, so we can just return unmatched.
    // We retain this method signature so UI components don't break.
    return newTransactions;
  }

  Future<void> confirmMatch(String transactionId) async {
    _pendingMatches.removeWhere((m) => m.transactionId == transactionId);
    notifyListeners();
  }

  Future<void> rejectMatch(String transactionId) async {
    _pendingMatches.removeWhere((m) => m.transactionId == transactionId);
    notifyListeners();
  }
}
