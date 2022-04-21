import React, { createContext, useState } from 'react';

// Context
const AuthContext = createContext();

// Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // 사용자의 정보가 담겨 있는 상태 변수

  // 로그인 성공시 호출하여 상태 값에 사용자 정보를 기억해두는 함수
  const login = (res) => {
    setUser({
      username: res.username,
      role: res.role,
      strategy: res.strategy
    });
  }

  // 로그아웃시 호출하여 사용자 상태 값을 초기 상태로 초기화 하는 함수
  const logout = () => setUser(undefined);

  // 외부에 반환할 값
  const value = {
    state: { user }, // 상태 변수
    actions: { login, logout } // 외부에서 호출 가능한 함수
  };

  return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

// Consumer
const { Consumer: AuthConsumer } = AuthContext;

export { AuthProvider, AuthConsumer }; // Provider와 Consumer 반환
export default AuthContext; // Context 반환