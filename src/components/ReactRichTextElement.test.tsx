import React from 'react';
import { render, screen } from '@testing-library/react';
import ReactRichTextElement from './ReactRichTextElement';
import { createDeliveryClient, Elements, linkedItemsHelper } from '@kentico/kontent-delivery';
import richTextItem from './richTextItem.json';

test('Parse rich text', () => {

  var mockClient = createDeliveryClient({
    projectId: 'dummyClient',
  });

  const response = mockClient.item("dummyItem")
    .map(richTextItem);


  const { debug } = render(<ReactRichTextElement
    element={response.item.elements["bio"] as Elements.RichTextElement}
    linkedItems={linkedItemsHelper.convertLinkedItemsToArray(response.linkedItems)}
  />);

  debug();
});
