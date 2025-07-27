import SwiftUI
import LinkKit

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
    @StateObject private var viewModel = AccountsViewModel()
    @State private var showPlaidLink: Bool = false
    @State private var plaidHandler: Handler?

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Accounts")
                    .font(.largeTitle)

                if viewModel.isLinking {
                    ProgressView("Linking with Plaid...")
                        .padding(.vertical)
                } else {
                    Button(action: {
                        Task {
                            if let linkToken: String = try? await viewModel.getPlaidLinkToken() {
                                viewModel.plaidLinkToken = linkToken
                                showPlaidLink = true
                            } else {
                                viewModel.plaidLinkToken = nil
                            }
                        }
                    }) {    
                        HStack {
                            Image(systemName: "link")
                            Text("Link Account")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }

                if viewModel.accounts.isEmpty {
                    Text("No accounts linked yet.")
                        .foregroundColor(.secondary)
                } else {
                    List(viewModel.accounts) { account in
                        VStack(alignment: .leading) {
                            Text(account.name)
                                .font(.headline)
                            Text(account.type.capitalized)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .listStyle(PlainListStyle())
                }

                Spacer()
            }
            .padding()
            .navigationTitle("Accounts")
            .sheet(isPresented: $showPlaidLink, onDismiss: {
                print("Plaid sheet dismissed, clearing handler")
                plaidHandler = nil
            }) {
                if let linkToken: String = viewModel.plaidLinkToken {
                    PlaidLinkCoordinator(linkToken: linkToken) { result  in
                        print("PlaidLinkCoordinator result: \(result)")
                        print("PlaidLinkCoordinator result: \(result)")
                        showPlaidLink = false
                        plaidHandler = nil
                        switch result {
                        case .success(let publicToken, let success):
                            print("PlaidLinkCoordinator success: publicToken=\(publicToken), success=\(success)")
                            Task { await viewModel.handlePlaidSuccess(publicToken: publicToken, success: success) }
                        case .failure(let error):
                            print("PlaidLinkCoordinator failure: \(error)")
                            viewModel.errorMessage = error.localizedDescription
                        case .exit:
                            print("PlaidLinkCoordinator exit")
                            break
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Plaid Link Coordinator
struct PlaidLinkCoordinator: UIViewControllerRepresentable {
    let linkToken: String
    let onResult: (PlaidLinkResult) -> Void

    class Coordinator: NSObject {
        var parent: PlaidLinkCoordinator?
        var handler: Handler?
    }

    func makeCoordinator() -> Coordinator {
        let coordinator = Coordinator()
        coordinator.parent = self
        return coordinator
    }

    func makeUIViewController(context: Context) -> UIViewController {
        print("PlaidLinkCoordinator.makeUIViewController called with linkToken: \(linkToken)")
        // Return a blank UIViewController for SwiftUI sheet
        return UIViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        // Only present Plaid Link if not already presented
        guard context.coordinator.handler == nil else { return }
        print("PlaidLinkCoordinator.updateUIViewController called")
        let config = LinkTokenConfiguration(token: linkToken) { success in
            print("PlaidLinkCoordinator LinkTokenConfiguration success callback: publicToken=\(success.publicToken)")
            onResult(.success(publicToken: success.publicToken, success: success))
        }
        let result = Plaid.create(config)
        print("Plaid.create result: \(result)")
        switch result {
        case .success(let handler):
            print("Plaid handler created: \(handler)")
            context.coordinator.handler = handler
            DispatchQueue.main.async {
                handler.open(presentUsing: .viewController(uiViewController))
            }
        case .failure(let error):
            print("Plaid.create failed: \(error)")
            onResult(.failure(error))
        }
    }
}

enum PlaidLinkResult {
    case success(publicToken: String, success: LinkSuccess)
    case failure(Error)
    case exit
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
