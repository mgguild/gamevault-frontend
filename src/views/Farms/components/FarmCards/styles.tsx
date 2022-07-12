import styled, { ThemeContext } from 'styled-components'
import { Flex } from '@metagg/mgg-uikit'

export const Cards2 = styled.button<{ src?: string; bgColor?: string }>`
  position: relative;
  min-width: 20rem;
  min-height: 12rem;
  cursor: pointer;
  border: none;
  padding: 0;
  text-align: left;
  flex: 1;
  background-color: ${({ bgColor }) => bgColor ?? '#030f62'};
  ${({ src }) =>
    `&:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0.2;
      width: 100%;
      height: 100%;
      z-index: 0;
      background-image: url(${src ?? `./MGG.png`});
      background-repeat: no-repeat;
      // background-attachment: fixed;
      background-position: center;
      background-size: cover;
    }`}
`

export const Card2Container = styled.div`
  position: relative;
  padding: 1rem 0rem;
  // background: linear-gradient(0deg,rgb(0 0 0) 0%,rgb(0 0 0 / 50%) 25%,rgba(36,121,9,0) 75%);
  width: 100%;
  height: 100%;
  z-index: 2;

  ${({theme}) => theme.mediaQueries.md} {
    padding: 2rem 1.5rem;
  }
`
export const TokenLogo = styled.img<{ size?: string }>`
  border-radius: 50%;
  height: ${({ size }) => (!size ? '80px' : size)};
  width: ${({ size }) => (!size ? '80px' : size)};
  z-index: 2;
  @media (max-width: 500px) {
    height: ${({ size }) => (!size ? '50px' : size)};
    width: ${({ size }) => (!size ? '50px' : size)};
  }
`

export const Badge = styled.div<{ type?: number }>`
  ${({ type }) =>
    type
      ? `
      padding: 0.2rem 0.5rem;
      border: thin solid white;
      border-radius: 0.3rem;
    `
      : `
      padding: 0.2rem 0.5rem;
      background-color: rgb(0,196,204);
      border-radius: 0.3rem;
    `}
`

export const LinearBG = styled.div<{ src?: string; bgColor?: string; contain?: boolean }>`
  height: 100%;
  background: linear-gradient(0deg, rgb(0 0 0) 0%, rgb(0 0 0 / 50%) 25%, rgba(36, 121, 9, 0) 75%);
`

export const PageContainer = styled.div<{ bgColor?: string; src?: string; contain?: boolean }>`
  background-color: ${({ bgColor }) => bgColor ?? '#030f62'};
  ${({ src, contain }) =>
    `&:before {
  content: '';
  position: absolute;
  inset:  ${contain ? '10rem 0 0 -2vh' : '0 0 0 0'};
  opacity: 0.2;
  width: 100%;
  height: ${contain ? '30vw' : null};
  z-index: 2;
  background-image: url(${src ?? `./MGG-BG.svg`});
  background-repeat: no-repeat;
  background-position: ${contain ? 'right' : 'center'};
  background-size: contain;
}`}
`
