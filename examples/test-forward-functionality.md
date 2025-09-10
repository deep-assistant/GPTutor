# Testing Message Forwarding Functionality

## Changes Made

1. **ShareService.ts** - Added `forwardMessage` method
   - Takes message content and sender name
   - Creates formatted message with source attribution
   - Uses VK Bridge to show wall post box
   - Returns promise for proper error handling

2. **Message.tsx** - Added forward button
   - Added `Icon24Share` import from VK icons
   - Added `shareService` import
   - Created `onForwardMessage` handler
   - Added IconButton with share icon in the icons block

## Expected Behavior

When user clicks the forward (share) icon on any message:
1. The `onForwardMessage` handler is triggered
2. It extracts the sender name (GPT name for assistant or user's first name)
3. Creates formatted forwarding text including:
   - Original sender identification
   - Complete message content
   - Attribution to GPTutor app
4. Opens VK wall post box with the formatted message
5. User can share to their wall or send to friends

## Integration Points

- Uses existing VK Bridge integration
- Follows existing UI patterns (same icon styling as copy/select buttons)
- Maintains existing message structure and styling
- Compatible with existing message selection system

## Files Modified

- `/src/services/ShareService.ts` - Added forwardMessage method
- `/src/components/Messenger/MessengerList/Message/Message.tsx` - Added forward button and handler

## Russian Context

The forwarding message is formatted in Russian:
- "Сообщение от [Sender Name]:" - "Message from [Sender Name]:"
- "Передано через GPTutor:" - "Forwarded via GPTutor:"