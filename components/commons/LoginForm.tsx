/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import React, { MouseEventHandler, useState } from 'react';

interface OnClickProps {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  data?: any;
  items?: any[];
  onClickLogin?: MouseEventHandler<HTMLElement> | undefined;
  onClickGuest?: MouseEventHandler<HTMLElement> | undefined;
  onSubmitLogin?: MouseEventHandler<HTMLFormElement> | undefined;
  onChangeEmail?: MouseEventHandler<HTMLInputElement> | undefined;
  onChangePassword?: MouseEventHandler<HTMLInputElement> | undefined;
  onFocusEmail?: MouseEventHandler<HTMLInputElement> | undefined;
  onFocusPassword?: MouseEventHandler<HTMLInputElement> | undefined;
  onBlurEmail?: MouseEventHandler<HTMLInputElement> | undefined;
  onBlurPassword?: MouseEventHandler<HTMLInputElement> | undefined;
}

const CarLoginComponent: React.FC<OnClickProps> = ({
  id,
  style,
  className,
  data,
  items,
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const safeData = data ?? {};
  const title = _.get(data, 'title', 'Login');
  const subtitle = _.get(data, 'subtitle', 'Enter your credentials to access your account.');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
    props.onChangeEmail?.(e as any);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
    props.onChangePassword?.(e as any);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://car.blocktrend.xyz/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        const accessToken = _.get(responseData, 'data.accessToken');
        const refreshToken = _.get(responseData, 'data.refreshToken');
        const roleName = _.get(responseData, 'data.role.name');
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (roleName) {
          localStorage.setItem('role', roleName);
        }

        // Call the optional callback
        props.onSubmitLogin?.(e as any);

        // Redirect to /user
        router.push('/user/drivers');
      } else {
        const errorMessage = _.get(responseData, 'message', 'Login failed. Please try again.');
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClickLogin?.(e);
  };

  const handleGuestClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClickGuest?.(e);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${className ?? ''}`}
      id={id}
      style={style}
    >
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Login Form Section */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 relative">
          {/* Decorative blob shape */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-lime-100 rounded-full opacity-50"></div>
            <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-lime-50 rounded-full opacity-30"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-lime-600 mb-2">{title}</h1>
            <p className="text-gray-600 mb-8">{subtitle}</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={props.onFocusEmail as any}
                  onBlur={props.onBlurEmail as any}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={props.onFocusPassword as any}
                  onBlur={props.onBlurPassword as any}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-lime-600 hover:text-lime-800 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                onClick={handleLoginClick}
                disabled={isLoading}
                className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>

            <button
              onClick={handleGuestClick}
              disabled={isLoading}
              className="w-full mt-4 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Register
            </button>
          </div>
        </div>

        {/* Car Image Section */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="relative z-10">
            <img
              src="https://www.mioto.vn/static/media/thue_xe_oto_tu_lai_di_du_lich_gia_re.fde3ac82.png"
              className="h-full w-full"
              alt="Car for rent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarLoginComponent;
