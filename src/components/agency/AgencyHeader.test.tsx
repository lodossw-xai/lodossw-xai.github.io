import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AgencyHeader from './AgencyHeader';

describe('AgencyHeader navigation', () => {
  it('opens the current site menu with real page routes', () => {
    render(
      <MemoryRouter initialEntries={['/privacy']}>
        <AgencyHeader />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));

    expect(screen.getByRole('link', { name: /HOME/ })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: /ABOUT/ })).toHaveAttribute(
      'href',
      '/about'
    );
    expect(screen.getByRole('link', { name: /WORK/ })).toHaveAttribute(
      'href',
      '/work'
    );
    expect(screen.getByRole('link', { name: /CAREERS/ })).toHaveAttribute(
      'href',
      '/careers'
    );
    expect(screen.getByRole('link', { name: /CONTACT/ })).toHaveAttribute(
      'href',
      '/contact'
    );
    expect(
      screen.getByRole('link', { name: '프로젝트 문의하기' })
    ).toHaveAttribute('href', '/contact#contact-inquiry');
  });

  it('closes with Escape and returns focus to the menu button', () => {
    render(
      <MemoryRouter initialEntries={['/terms']}>
        <AgencyHeader />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: '메뉴 열기' });
    fireEvent.click(button);
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveFocus();
  });
});
