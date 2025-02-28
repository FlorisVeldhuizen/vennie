import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const HomePage = () => {
  const { currentUser } = useStore()
  
  return (
    <div className="container-app py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-primary-600 mb-4">Vennie</h1>
        <p className="text-xl mb-8">Find furniture you both love</p>
        
        {currentUser ? (
          <div className="space-y-6">
            <p className="text-lg">Welcome, {currentUser.name}!</p>
            
            <div className="flex justify-center gap-4">
              <Link to="/swipe" className="btn btn-primary">Start Swiping</Link>
              <Link to="/matches" className="btn btn-secondary">View Matches</Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default HomePage 