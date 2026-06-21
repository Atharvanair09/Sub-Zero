import 'package:shared_preferences/shared_preferences.dart';

/// Singleton service that holds the authenticated user's canonical identity.
///
/// The [userId] is the MongoDB _id returned by the backend — it is the same
/// regardless of whether the user signed in from web (Clerk) or mobile
/// (Google Sign-In). This guarantees all data is stored under one account.
class AuthService {
  AuthService._internal();
  static final AuthService instance = AuthService._internal();

  static const _keyUserId    = 'canonical_user_id';
  static const _keyUserEmail = 'user_email';
  static const _keyUserName  = 'user_name';
  static const _keyUserPhoto = 'user_photo_url';

  // ── In-memory cache ──────────────────────────────────────────────────────
  String? _userId;
  String? _email;
  String? _name;
  String? _photoUrl;

  // ── Getters ───────────────────────────────────────────────────────────────
  String? get userId    => _userId;
  String? get email     => _email;
  String? get name      => _name;
  String? get photoUrl  => _photoUrl;
  bool    get isSignedIn => _userId != null && _userId!.isNotEmpty;

  // ── Load persisted session on app start ───────────────────────────────────
  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _userId   = prefs.getString(_keyUserId);
    _email    = prefs.getString(_keyUserEmail);
    _name     = prefs.getString(_keyUserName);
    _photoUrl = prefs.getString(_keyUserPhoto);
  }

  // ── Called after a successful backend sync ────────────────────────────────
  Future<void> saveSession({
    required String userId,
    required String email,
    String? name,
    String? photoUrl,
  }) async {
    _userId   = userId;
    _email    = email;
    _name     = name;
    _photoUrl = photoUrl;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserId, userId);
    await prefs.setString(_keyUserEmail, email);
    if (name     != null) await prefs.setString(_keyUserName,  name);
    if (photoUrl != null) await prefs.setString(_keyUserPhoto, photoUrl);
  }

  // ── Clear session on sign-out ─────────────────────────────────────────────
  Future<void> clearSession() async {
    _userId   = null;
    _email    = null;
    _name     = null;
    _photoUrl = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUserEmail);
    await prefs.remove(_keyUserName);
    await prefs.remove(_keyUserPhoto);
  }
}
