import 'package:flutter/material.dart';
import 'auth_service.dart';
import 'onboarding_screen.dart';
import 'home_page.dart';
import 'goals_page.dart';
import 'budget_overview_page.dart';
import 'financial_health_page.dart';
import 'profile_page.dart';
import 'custom_navbar.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SubZero',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const _AuthGate(),
    );
  }
}

/// Waits for [AuthService.loadFromStorage()] to complete, then routes
/// to [MainLayout] if a session exists or [OnboardingScreen] if not.
class _AuthGate extends StatefulWidget {
  const _AuthGate();

  @override
  State<_AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<_AuthGate> {
  late final Future<void> _authFuture =
      AuthService.instance.loadFromStorage();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _authFuture,
      builder: (context, snapshot) {
        // Still loading — show a blank screen (or a splash)
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            backgroundColor: Color(0xFFF7F7F7),
            body: Center(child: CircularProgressIndicator(color: Colors.black)),
          );
        }

        // Storage loaded — route based on session
        return AuthService.instance.isSignedIn
            ? const MainLayout()
            : const OnboardingScreen();
      },
    );
  }
}

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomePage(),
    const GoalsPage(),
    const BudgetOverviewPage(),
    const FinancialHealthPage(),
    const ProfilePage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: CustomNavBar(
        currentIndex: _currentIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}
