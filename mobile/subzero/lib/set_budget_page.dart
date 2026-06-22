import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SetBudgetPage extends StatefulWidget {
  const SetBudgetPage({Key? key}) : super(key: key);

  @override
  _SetBudgetPageState createState() => _SetBudgetPageState();
}

class _SetBudgetPageState extends State<SetBudgetPage> {
  final _totalController = TextEditingController();
  final _foodController = TextEditingController();
  final _transportController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('SET LIMITS.', style: GoogleFonts.spaceMono(fontWeight: FontWeight.bold, color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('MONTHLY LIMIT', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _buildInput(_totalController, 'e.g. 5000'),
            const SizedBox(height: 32),
            Text('CATEGORIES', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Text('FOOD', style: GoogleFonts.spaceMono(color: Colors.white54, fontSize: 14)),
            const SizedBox(height: 4),
            _buildInput(_foodController, 'Food Limit'),
            const SizedBox(height: 16),
            Text('TRANSPORT', style: GoogleFonts.spaceMono(color: Colors.white54, fontSize: 14)),
            const SizedBox(height: 4),
            _buildInput(_transportController, 'Transport Limit'),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                ),
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('SAVE.', style: GoogleFonts.spaceMono(fontWeight: FontWeight.bold, fontSize: 20)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInput(TextEditingController controller, String hint) {
    return TextField(
      controller: controller,
      style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 24),
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.spaceMono(color: Colors.white24, fontSize: 24),
        filled: true,
        fillColor: Colors.white10,
        border: const OutlineInputBorder(borderSide: BorderSide(color: Colors.white54, width: 2), borderRadius: BorderRadius.zero),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Colors.white54, width: 2), borderRadius: BorderRadius.zero),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Colors.white, width: 2), borderRadius: BorderRadius.zero),
      ),
    );
  }
}
