@@ .. @@
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {useMagicLink ? 'Send Magic Link' : 'Sign In'}
            </Button>
@@ .. @@
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {useMagicLink ? 'Send Magic Link' : 'Sign In'}
            </Button>