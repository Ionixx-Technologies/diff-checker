import styled from 'styled-components';

export const TabsHeader = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 10px 12px;
  cursor: pointer;
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.subtleText)};
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.text : 'transparent')};
`;

export const TabsContent = styled.div`
  padding: 12px 0;
`;

