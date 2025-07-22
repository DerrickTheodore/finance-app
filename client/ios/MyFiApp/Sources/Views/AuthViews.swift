import SwiftUI

struct AuthRootView: View {
    @State private var showSignup = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // App Logo/Title
                VStack(spacing: 10) {
                    Image(systemName: "dollarsign.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.blue)
                    
                    Text("MyFi")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Your Personal Finance Companion")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.bottom, 40)
                
                // Auth Forms
                if showSignup {
                    SignupView(onSwitchToLogin: {
                        withAnimation {
                            showSignup = false
                        }
                    })
                } else {
                    LoginView(onSwitchToSignup: {
                        withAnimation {
                            showSignup = true
                        }
                    })
                }
                
                Spacer()
            }
            .padding()
        }
    }
}

struct LoginView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var email = ""
    @State private var password = ""
    
    let onSwitchToSignup: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Welcome Back")
                .font(.title2)
                .fontWeight(.semibold)
            
            VStack(spacing: 16) {
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            if let errorMessage = authManager.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Button(action: {
                Task {
                    await authManager.login(email: email, password: password)
                }
            }) {
                HStack {
                    if authManager.isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                    }
                    Text("Log In")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(authManager.isLoading || email.isEmpty || password.isEmpty)
            
            Button("Don't have an account? Sign up") {
                onSwitchToSignup()
            }
            .foregroundColor(.blue)
        }
    }
}

struct SignupView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    
    let onSwitchToLogin: () -> Void
    
    private var isFormValid: Bool {
        !email.isEmpty && 
        !password.isEmpty && 
        password == confirmPassword &&
        password.count >= 6
    }
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Create Account")
                .font(.title2)
                .fontWeight(.semibold)
            
            VStack(spacing: 16) {
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                SecureField("Confirm Password", text: $confirmPassword)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            if !password.isEmpty && password.count < 6 {
                Text("Password must be at least 6 characters")
                    .foregroundColor(.orange)
                    .font(.caption)
            }
            
            if !confirmPassword.isEmpty && password != confirmPassword {
                Text("Passwords don't match")
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            if let errorMessage = authManager.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Button(action: {
                Task {
                    await authManager.signup(email: email, password: password)
                }
            }) {
                HStack {
                    if authManager.isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                    }
                    Text("Sign Up")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(isFormValid ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(authManager.isLoading || !isFormValid)
            
            Button("Already have an account? Log in") {
                onSwitchToLogin()
            }
            .foregroundColor(.blue)
        }
    }
}

#Preview {
    AuthRootView()
}
