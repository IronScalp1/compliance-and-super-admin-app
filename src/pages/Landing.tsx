@@ .. @@
            <div className="flex items-center space-x-4">
-              <Button variant="ghost" asChild>
+              <Button variant="ghost" asChild className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
@@ .. @@
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="/auth/login">
                Sign In
              </Link>
            </Button>
@@ .. @@
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
              <Link to="/auth/login">
                Sign In
              </Link>
            </Button>