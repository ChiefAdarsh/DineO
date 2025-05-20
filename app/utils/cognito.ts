import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || "defaultUserPoolId",
  ClientId: process.env.EXPO_PUBLIC_CLIENT_ID || "defaultClientId",
});

export const signUp = (
  email: string,
  phoneNumber: string,
  name: string,
  password: string,
  confirmPassword: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!email || !password || !confirmPassword || !name || !phoneNumber) {
      reject("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      reject("Passwords do not match.");
      return;
    }

    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phoneNumber }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
    ];

    userPool.signUp(email, password, attributes, [], async (err, result) => {
      if (err) {
        console.error("Signup Error:", err);
        reject(err.message || JSON.stringify(err));
      } else {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        try {
          await fetch(`${apiUrl}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              phone_number: phoneNumber,
              full_name: name,
              profile_picture: "",
              posts: [],
              comments: [],
            }),
          });
        } catch (error) {
          console.warn("Failed to sync user to backend, continuing anyway.");
        }
        resolve(
          "Signup successful! Check your email for the confirmation code."
        );
      }
    });
  });
};

export const confirmSignUp = (email: string, code: string): Promise<string> => {
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

/**
 * Sign in user to Cognito
 */
export const signIn = (email: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    user.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve(session.getIdToken().getJwtToken()); // Return JWT Token
      },
      onFailure: (err) => {
        reject(err.message || JSON.stringify(err));
      },
    });
  });
};

/**
 * Sign out user from Cognito
 */
export const signOut = (email: string): void => {
  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });
  user.signOut();
};

export const getCurrentUser = (): Promise<CognitoUser | null> => {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err: any, session: { isValid: () => any }) => {
      if (err || !session.isValid()) return resolve(null);
      resolve(user);
    });
  });
};
