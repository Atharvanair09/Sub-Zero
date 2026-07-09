import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'income_models.dart';
import 'income_service.dart';
import 'add_income_source_page.dart';

class IncomeSourcesListPage extends StatefulWidget {
  const IncomeSourcesListPage({super.key});

  @override
  State<IncomeSourcesListPage> createState() => _IncomeSourcesListPageState();
}

class _IncomeSourcesListPageState extends State<IncomeSourcesListPage> {
  @override
  void initState() {
    super.initState();
    IncomeService.instance.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    IncomeService.instance.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final sources = IncomeService.instance.incomeSources;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F7F7),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black, size: 28),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'INCOME SOURCES',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 18,
            letterSpacing: -0.5,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2.0),
          child: Container(color: Colors.black, height: 2.0),
        ),
      ),
      body: sources.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Text(
                  'NO INCOME SOURCES FOUND.\nADD ONE TO AUTOMATE TRACKING.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800,
                    color: Colors.grey[600],
                  ),
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: sources.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final source = sources[index];
                return _buildSourceCard(source);
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const AddIncomeSourcePage()),
          );
        },
        backgroundColor: const Color(0xFF9AFF00),
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black, width: 2),
          borderRadius: BorderRadius.zero,
        ),
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  Widget _buildSourceCard(IncomeSource source) {
    return Container(
      decoration: BoxDecoration(
        color: source.isActive ? Colors.white : Colors.grey[300],
        border: Border.all(color: Colors.black, width: 2),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            source.name.toUpperCase(),
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w900,
                              fontSize: 18,
                            ),
                          ),
                          if (!source.isActive)
                            Padding(
                              padding: const EdgeInsets.only(left: 8.0),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                color: Colors.black,
                                child: Text(
                                  'INACTIVE',
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'SENDER: ${source.sender}',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                          color: Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '₹${source.expectedAmount.toStringAsFixed(0)}',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    color: const Color(0xFF3B8000),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Colors.black, thickness: 2),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'FREQ: ${source.frequency.toUpperCase()}',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
                Text(
                  source.lastReceivedDate != null
                      ? 'LAST: ${source.lastReceivedDate!.toLocal().toString().split(' ')[0]}'
                      : 'LAST: NEVER',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(height: 2, color: Colors.black),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () async {
                    await IncomeService.instance.updateIncomeSource(
                      source.copyWith(isActive: !source.isActive),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    color: Colors.white,
                    child: Center(
                      child: Text(
                        source.isActive ? 'DEACTIVATE' : 'ACTIVATE',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Container(width: 2, height: 40, color: Colors.black),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AddIncomeSourcePage(existingSource: source),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    color: const Color(0xFFFFF0D4),
                    child: Center(
                      child: Text(
                        'EDIT',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
