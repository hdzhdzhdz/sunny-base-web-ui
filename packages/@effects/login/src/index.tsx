import React from 'react';
import { Button, Input, Select, ConfigProvider } from 'antd';
import { User, Lock, Eye, EyeOff, LayoutGrid, Monitor } from 'lucide-react';

export interface LoginProps {
  images: {
    bg01: string;
    bg02: string;
    logo: string;
    slogen01: string;
    slogen02: string;
    slogen03: string;
  }
}

export const Login: React.FC<LoginProps> = ({ images }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5259f6',
          borderRadius: 4,
        },
        components: {
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.5)',
            colorBorder: 'transparent',
            hoverBorderColor: 'transparent',
            activeBorderColor: '#5259f6',
            activeShadow: '0 0 0 2px rgba(82, 89, 246, 0.2)',
            colorTextPlaceholder: 'rgba(0, 0, 0, 0.45)',
          },
          Select: {
            colorBgContainer: 'rgba(255, 255, 255, 0.5)',
            colorBorder: 'transparent',
            hoverBorderColor: 'transparent',
            activeBorderColor: '#5259f6',
            activeOutlineColor: 'rgba(82, 89, 246, 0.2)',
            colorTextPlaceholder: 'rgba(0, 0, 0, 0.45)',
          },
          Button: {
             defaultBg: '#5259f6',
             defaultColor: '#fff',
             defaultBorderColor: 'transparent',
             defaultHoverBg: '#4046c4',
             defaultHoverColor: '#fff',
             defaultHoverBorderColor: 'transparent',
          }
        }
      }}
    >
      <div className="relative w-screen h-screen bg-[#2851af] overflow-hidden">
        {/* Background Layer 1 */}
        <div 
          className="absolute inset-0 z-[1] bg-no-repeat bg-cover bg-fixed"
          style={{ backgroundImage: `url(${images.bg01})` }}
        />
        
        {/* Background Layer 2 */}
        <img 
          className="absolute w-full h-full left-[4%] top-0 z-[2]" 
          src={images.bg02} 
          alt="bg" 
        />
        
        {/* Decorative Lines */}
        <div className="absolute left-[50.3%] top-[-18%] z-[3] rotate-[26deg] w-[4px] h-[20%] bg-[#ffffffcc]" />
        <div className="absolute left-[67.3%] top-[98%] z-[3] rotate-[26deg] w-[4px] h-[20%] bg-[#ffffffcc]" />

        {/* Logo */}
        <img 
          className="absolute w-[19%] h-[7%] left-[6%] top-[28%] z-[4]" 
          src={images.logo} 
          alt="logo" 
        />

        {/* Slogan Animation Container */}
        <div className="absolute w-[42%] h-[18%] left-[6%] top-[38%] z-[4] overflow-hidden group">
          <img 
            className="slogen-img absolute left-0 top-0 w-full max-h-full transition-transform duration-400 ease-in origin-bottom animate-slogan-1" 
            src={images.slogen01} 
            alt="slogen" 
          />
          <img 
            className="slogen-img absolute left-0 top-0 w-full max-h-full transition-transform duration-400 ease-in origin-bottom animate-slogan-2" 
            src={images.slogen02} 
            alt="slogen" 
          />
          <img 
            className="slogen-img absolute left-0 top-0 w-full max-h-full transition-transform duration-400 ease-in origin-bottom animate-slogan-3" 
            src={images.slogen03} 
            alt="slogen" 
          />
        </div>

        {/* Login Form Panel */}
        <div className="absolute left-[70%] top-1/2 -translate-y-[55%] w-[25%] z-[4]">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
            {/* Account Field */}
            <div className="flex items-center group">
              <div className="w-10 flex justify-center text-white/80 transition-colors group-focus-within:text-white">
                <User size={22} strokeWidth={1.5} />
              </div>
              <Input 
                placeholder="账号" 
                className="flex-1 h-11 !bg-white/50 !border-none hover:!bg-white/60 focus:!bg-white/90 text-gray-800 placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            {/* Password Field */}
            <div className="flex items-center group">
              <div className="w-10 flex justify-center text-white/80 transition-colors group-focus-within:text-white">
                <Lock size={22} strokeWidth={1.5} />
              </div>
              <Input.Password
                placeholder="密码"
                className="flex-1 h-11 !bg-white/50 !border-none hover:!bg-white/60 focus-within:!bg-white/90 text-gray-800 placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                iconRender={(visible) => (visible ? <Eye size={16} /> : <EyeOff size={16} />)}
              />
            </div>

            {/* Language Field */}
            <div className="flex items-center group">
              <div className="w-10 flex justify-center text-white/80 transition-colors group-hover:text-white">
                <LayoutGrid size={22} strokeWidth={1.5} />
              </div>
              <Select
                defaultValue="zh-CN"
                className="flex-1 h-11 [&_.ant-select-selector]:!bg-white/50 [&_.ant-select-selector]:!border-none hover:[&_.ant-select-selector]:!bg-white/60 backdrop-blur-sm"
                options={[
                  { value: 'zh-CN', label: '语言 简体中文' },
                  { value: 'en-US', label: 'Language English' }
                ]}
              />
            </div>

            {/* MAC Address Field */}
            <div className="flex items-center group">
              <div className="w-10 flex justify-center text-white/80 transition-colors group-hover:text-white">
                <Monitor size={22} strokeWidth={1.5} />
              </div>
              <div className="flex-1 h-11 px-3 bg-white/50 hover:bg-white/60 flex items-center text-gray-800 rounded text-sm overflow-hidden whitespace-nowrap backdrop-blur-sm transition-colors duration-300 cursor-default">
                <span className="opacity-60 mr-2 select-none">MAC</span>
                <span className="font-mono text-gray-700">8C:47:BE:1D:5A:56...</span>
              </div>
            </div>
            
            {/* Login Button */}
            <div className="pl-10 mt-4">
              <Button 
                type="primary"
                className="w-full h-11 text-base font-normal tracking-wider !bg-[#5259f6] hover:!bg-[#4046c4] border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => alert('Login functionality to be implemented')}
              >
                登录
              </Button>
            </div>
            
            {/* Footer Text */}
            <div className="pl-10 mt-4 text-xs text-white/70 space-y-3 leading-relaxed font-light">
              <div className="space-y-1">
                <div className="flex flex-col">
                  <span>如果您无法获取到MAC地址，请先下载并安装插件：</span>
                  <div className="flex gap-4 mt-1">
                     <a href="#" className="text-[#8cc5ff] hover:text-white hover:underline transition-colors flex items-center gap-1">
                        <span>下载地址1</span>
                     </a>
                     <a href="#" className="text-[#8cc5ff] hover:text-white hover:underline transition-colors flex items-center gap-1">
                        <span>下载地址2</span>
                     </a>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-white/10">
                <span>公司内部人员另外登录途径：</span>
                <a href="#" className="text-[#8cc5ff] hover:text-white hover:underline ml-1 transition-colors font-normal">单点登录</a>
              </div>
            </div>
          </form>
        </div>

        {/* Copyright */}
        <div className="absolute left-1/2 bottom-[3%] -translate-x-1/2 z-[4] text-xs text-white/60 tracking-wider">
          SUNNY SINGLE SIGN-ON PLATFORM◎ 2023 · SUNNY OPTICAL TECHNOLOGY(GROUP)CO.,LTD
        </div>
      </div>
    </ConfigProvider>
  );
};
