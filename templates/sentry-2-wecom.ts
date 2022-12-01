interface SentryEvent {
  project: string
}

interface WechatWorkTextMsg {
  msgtype: 'text'
  text: {
    content: string
    mentioned_list?: string[]
    mentioned_mobile_list?: string[]
  }
}

interface WechatWorkMarkdownMsg {
  msgtype: 'markdown'
  markdown: {
    content: string
  }
}

// WechatWork msg type: ... | 'image' | 'news' | 'file' | 'template_card'


export function sentry2WechatWork(sentryEvent: SentryEvent): WechatWorkTextMsg {
  return {
    msgtype: 'text',
    text: {
      content: `Received sentry event from ${sentryEvent.project}`,
      mentioned_list: ['@all']
    }
  }
}
