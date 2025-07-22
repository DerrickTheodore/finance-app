import Foundation
import Combine

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isLoggedIn = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiClient = APIClient.shared
    private let keychainManager = KeychainManager.shared
    
    private init() {
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        isLoggedIn = keychainManager.getToken() != nil
        
        if isLoggedIn {
            Task {
                await getCurrentUser()
            }
        }
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let authResponse = try await apiClient.login(email: email, password: password)
            
            // Save token to keychain
            _ = keychainManager.saveToken(authResponse.token)
            
            // Update state
            currentUser = authResponse.user
            isLoggedIn = true
        } catch {
            if let apiError = error as? APIClientError {
                errorMessage = apiError.errorDescription
            } else {
                errorMessage = error.localizedDescription
            }
        }
        
        isLoading = false
    }
    
    func signup(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let authResponse = try await apiClient.signup(email: email, password: password)
            
            // Save token to keychain
            _ = keychainManager.saveToken(authResponse.token)
            
            // Update state
            currentUser = authResponse.user
            isLoggedIn = true
        } catch {
            if let apiError = error as? APIClientError {
                errorMessage = apiError.errorDescription
            } else {
                errorMessage = error.localizedDescription
            }
        }
        
        isLoading = false
    }
    
    func logout() async {
        isLoading = true
        
        do {
            try await apiClient.logout()
        } catch {
            // Even if logout fails on server, clear local state
            print("Logout error: \(error)")
        }
        
        // Clear local state
        _ = keychainManager.deleteToken()
        currentUser = nil
        isLoggedIn = false
        isLoading = false
    }
    
    private func getCurrentUser() async {
        do {
            currentUser = try await apiClient.getCurrentUser()
        } catch {
            // If we can't get current user, token might be invalid
            if error is APIClientError {
                await logout()
            }
        }
    }
}
