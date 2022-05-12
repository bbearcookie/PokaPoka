import React, { createContext, useState } from 'react';

export const STORAGE_KEY_NAME = 'USER'; // 세션 스토리지에 저장할 키

const initialUser = {
  username: '',
  role: '',
  strategy: ''
}

// Context
const AuthContext = createContext({
  user: initialUser
});

// Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);

  // 로그인 성공시 호출하여 사용자 정보를 기억해두는 함수
  const login = (res) => {

    // 상태 값에 사용자 정보를 기억해둠.
    let user = {
      username: res.username,
      role: res.role,
      strategy: res.strategy
    };
    setUser(user);

    // 상태 값은 새로고침시 초기화되기 때문에 브라우저의 세션 스토리지에도 정보를 저장해둔다.
    // 페이지 새로고침시 세션 스토리지에 저장된 정보를 가지고 상태 값에 그대로 저장하게 된다.
    sessionStorage.setItem(STORAGE_KEY_NAME, JSON.stringify(user));
  }

  // 로그아웃시 호출하여 사용자 정보를 초기 상태로 초기화 하는 함수
  const logout = () => {
    setUser(initialUser); // 상태 값 초기화
    sessionStorage.removeItem(STORAGE_KEY_NAME); // 세션 스토리지 값 초기화
  }

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