import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  userId?: string;
  email: string;
  name: string;
  phone_number: string;
  profile_picture?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    phone: string,
    name: string,
    password: string,
    confirmPassword: string
  ) => Promise<string>;
  confirmSignUp: (email: string, code: string) => Promise<string>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cognito setup
const userPool = new CognitoUserPool({
  UserPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || "defaultUserPoolId",
  ClientId: process.env.EXPO_PUBLIC_CLIENT_ID || "defaultClientId",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = userPool.getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      currentUser.getSession(async (err: any, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          setLoading(false);
          return;
        }

        const email = currentUser.getUsername();
        try {
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/users?email=${email}`
          );
          const data = await res.json();
          if (res.ok && data.user) setUser(data.user);
        } catch {
          console.warn("Failed to fetch user from DB");
        } finally {
          setLoading(false);
        }
      });
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    await new Promise<void>((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          try {
            const res = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/users?email=${email}`
            );
            const data = await res.json();
            if (res.ok && data.user) {
              setUser(data.user);
              resolve();
            } else {
              reject("Failed to fetch user from DB");
            }
          } catch (err) {
            reject(err);
          } finally {
            setLoading(false);
          }
        },
        onFailure: (err) => {
          setLoading(false);
          reject(err.message || JSON.stringify(err));
        },
      });
    });
  };

  const signUp = async (
    email: string,
    phone: string,
    name: string,
    password: string,
    confirmPassword: string
  ) => {
    if (!email || !password || !confirmPassword || !name || !phone)
      throw new Error("All fields are required.");
    if (password !== confirmPassword)
      throw new Error("Passwords do not match.");

    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phone }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
    ];

    return await new Promise<string>((resolve, reject) => {
      userPool.signUp(email, password, attributes, [], async (err, result) => {
        if (err) {
          reject(err.message || JSON.stringify(err));
          return;
        }

        // Sync to DB
        try {
          await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              phone_number: phone,
              name,
              profile_picture: "",
            }),
          });
        } catch (err) {
          console.warn("Failed to sync user to backend:", err);
        }

        resolve("Signup successful! Please check your email for confirmation.");
      });
    });
  };

  const confirmSignUp = (email: string, code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err.message || JSON.stringify(err));
        } else {
          resolve("Account confirmed! You can now log in.");
        }
      });
    });
  };

  const signOut = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) currentUser.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
