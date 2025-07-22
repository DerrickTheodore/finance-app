import UIKit
import SwiftUI

protocol Coordinator {
    func start()
}

@MainActor
class AppCoordinator: Coordinator {
    private let window: UIWindow
    private var childCoordinators: [Coordinator] = []
    private var authManager = AuthManager.shared
    
    init(window: UIWindow) {
        self.window = window
    }
    
    func start() {
        if authManager.isLoggedIn {
            showMainApp()
        } else {
            showAuth()
        }
        
        // Listen for auth state changes
        Task {
            for await _ in authManager.$isLoggedIn.values {
                if authManager.isLoggedIn {
                    showMainApp()
                } else {
                    showAuth()
                }
            }
        }
    }
    
    private func showAuth() {
        let authView = AuthRootView()
        let hostingController = UIHostingController(rootView: authView)
        window.rootViewController = hostingController
    }
    
    private func showMainApp() {
        let mainView = MainTabView()
        let hostingController = UIHostingController(rootView: mainView)
        window.rootViewController = hostingController
    }
}
