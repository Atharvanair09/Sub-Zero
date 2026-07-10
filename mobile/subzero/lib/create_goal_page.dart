import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class CreateGoalPage extends StatefulWidget {
  const CreateGoalPage({super.key});

  @override
  State<CreateGoalPage> createState() => _CreateGoalPageState();
}

class _CreateGoalPageState extends State<CreateGoalPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _targetController = TextEditingController();
  bool _isLoading = false;

  String _getBackendUrl() {
    return 'https://sub-zero-50le.onrender.com';
  }

  Future<void> _saveGoal() async {
    final name = _nameController.text.trim();
    final targetStr = _targetController.text.trim();
    if (name.isEmpty || targetStr.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    final target = double.tryParse(targetStr);
    if (target == null || target <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid target amount')));
      return;
    }

    setState(() => _isLoading = true);
    final userId = AuthService.instance.userId ?? '';

    try {
      final response = await http.post(
        Uri.parse('${_getBackendUrl()}/api/cashflow/savings-goals'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'name': name,
          'targetAmount': target,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        if (!mounted) return;
        Navigator.pop(context);
      } else {
        throw Exception('Failed to save goal');
      }
    } catch (e) {
      debugPrint('Error saving goal: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error saving goal')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F4F6),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'NEW GOAL',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: -0.5,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: Container(color: Colors.black, height: 2),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'NAME YOUR GOAL',
              style: GoogleFonts.inter(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 2),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
              ),
              child: TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  border: InputBorder.none,
                  hintText: 'e.g. TOKYO TRIP',
                ),
                style: GoogleFonts.inter(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'TARGET AMOUNT (\$)',
              style: GoogleFonts.inter(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 2),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
              ),
              child: TextField(
                controller: _targetController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  border: InputBorder.none,
                  hintText: 'e.g. 5000',
                ),
                style: GoogleFonts.inter(fontWeight: FontWeight.bold),
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: _isLoading ? null : _saveGoal,
              child: Container(
                height: 56,
                decoration: BoxDecoration(
                  color: _isLoading ? Colors.grey : const Color(0xFFC6FF00),
                  border: Border.all(color: Colors.black, width: 3),
                  boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                ),
                child: Center(
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.black)
                    : Text(
                        'SAVE GOAL',
                        style: GoogleFonts.inter(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w900),
                      ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
