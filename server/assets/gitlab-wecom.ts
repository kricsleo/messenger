interface GitlabPushEvent {
  project: {
    name: string
  }
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

interface Meta {
  description?: string
  target: string | string[]
}
export const meta: Meta = {
  description: 'Bonjour!',
  target: 'https://bing.com'
}

export default function gitlab2WechatWork(gitlabPushEvent: GitlabPushEvent): WechatWorkTextMsg {
  return {
    msgtype: 'text',
    text: {
      content: `Received push event from ${gitlabPushEvent.project.name}`,
      mentioned_list: ['@all']
    }
  }
}
