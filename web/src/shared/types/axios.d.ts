import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRetry?: boolean;
    _retry?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuthRetry?: boolean;
    _retry?: boolean;
  }
}
