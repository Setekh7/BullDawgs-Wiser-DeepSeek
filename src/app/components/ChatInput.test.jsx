import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ChatInput from './ChatInput';

describe('ChatInput', () => {
  test('renders input and buttons', () => {
    render(<ChatInput onSendMessage={jest.fn()} />);

    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByText(/send/i)).toBeInTheDocument();
  });

  test('calls onSendMessage with input text and file', () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} />);

    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: 'Hello world' } });

    const sendButton = screen.getByText(/send/i);
    fireEvent.click(sendButton);

    expect(mockSend).toHaveBeenCalledWith('Hello world', null);
  });
});
