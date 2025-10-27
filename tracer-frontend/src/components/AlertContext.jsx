import { createContext, useContext, useState } from 'react';
import Alert from './Alert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newAlert = { id, message, type, duration };
    
    setAlerts(prev => [...prev, newAlert]);
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const success = (message, duration) => showAlert(message, 'success', duration);
  const error = (message, duration) => showAlert(message, 'error', duration);
  const warning = (message, duration) => showAlert(message, 'warning', duration);
  const info = (message, duration) => showAlert(message, 'info', duration);

  return (
    <AlertContext.Provider value={{ success, error, warning, info, showAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {alerts.map((alert, index) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              type={alert.type}
              message={alert.message}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

