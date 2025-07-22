import SwiftUI

struct MainTabView: View {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some View {
        TabView {
            TransactionsView()
                .tabItem {
                    Image(systemName: "list.bullet")
                    Text("Transactions")
                }
            
            AccountsView()
                .tabItem {
                    Image(systemName: "building.columns")
                    Text("Accounts")
                }
            
            CategoriesView()
                .tabItem {
                    Image(systemName: "folder")
                    Text("Categories")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person")
                    Text("Profile")
                }
        }
    }
}

struct TransactionsView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Transactions")
                    .font(.largeTitle)
                Text("Coming soon...")
                    .foregroundColor(.secondary)
                Spacer()
            }
            .navigationTitle("Transactions")
        }
    }
}

struct AccountsView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Accounts")
                    .font(.largeTitle)
                Text("Coming soon...")
                    .foregroundColor(.secondary)
                Spacer()
            }
            .navigationTitle("Accounts")
        }
    }
}

struct CategoriesView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Categories")
                    .font(.largeTitle)
                Text("Coming soon...")
                    .foregroundColor(.secondary)
                Spacer()
            }
            .navigationTitle("Categories")
        }
    }
}

struct ProfileView: View {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                if let user = authManager.currentUser {
                    VStack(spacing: 10) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.blue)
                        
                        Text(user.email)
                            .font(.title2)
                            .fontWeight(.semibold)
                    }
                    .padding(.bottom, 30)
                }
                
                Button(action: {
                    Task {
                        await authManager.logout()
                    }
                }) {
                    HStack {
                        if authManager.isLoading {
                            ProgressView()
                                .scaleEffect(0.8)
                        }
                        Text("Log Out")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(authManager.isLoading)
                .padding(.horizontal)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Profile")
        }
    }
}

#Preview {
    MainTabView()
}
