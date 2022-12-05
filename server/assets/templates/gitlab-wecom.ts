/**
 * gitlab webhook message format
 * @see https://docs.gitlab.cn/jh/user/project/integrations/webhook_events.html
 */
interface GitlabPushMessage {
  user_name: string
  project: {
    name: string
  }
  repository: {
    git_http_url: string
  }
}

/**
 * Wecom robot message format.
 * @see https://developer.work.weixin.qq.com/document/path/91770
 */
type WecomRobot = WecomRobotText | WecomRobotMarkdown | WecomRobotImage | WecomRobotNews | WecomRobotFile | WecomRobotTemplateCard
interface WecomRobotText {
  msgtype: 'text'
  text: {
    // "<@userid>" means the user, "<@all>" means all group members
    // maxlength: 2048b
    // encode: utf8
    content: string
    mentioned_list?: string[]
    mentioned_mobile_list?: string[]
  }
}
interface WecomRobotMarkdown {
  msgtype: 'markdown'
  markdown: {
    // "<@userid>" means the user, "<@all>" means all group members
    // maxlength: 4096b
    // encode: utf8
    content: string
  }
}
interface WecomRobotImage {
  msgtype: 'image'
  image: {
    // max-size(before encode): 2M
    // format: JPG | PNG
    base64: string
    md5?: string
  }
}
interface WecomRobotNews {
  msgtype: 'news'
  news: {
    // max articles: 1~8
    articles: Array<{
      // maxlength: 128b
      title: string
      // maxlength: 512b
      description: string
      // target href when click
      url: string
      // format: JPG | PNG
      // recommended size: big - 1068*455，small - 150*150
      picurl: string
    }>
  }
}
interface WecomRobotFile {
  msgtype: 'file'
  file: {
    media_id: string
  }
}
interface WecomRobotTemplateCard {
  msgtype: 'template_card'
  template_card: {
    card_type: 'text_notice' | 'news_notice'
    // ...
    // @see https://developer.work.weixin.qq.com/document/path/91770#%E6%A8%A1%E7%89%88%E5%8D%A1%E7%89%87%E7%B1%BB%E5%9E%8B
    [k: string]: any
  }
}

interface Meta {
  description?: string
  target: string | string[]
}
export const meta: Meta = {
  description: 'Bonjour!',
  target: 'https://bing.com?key=demo'
}

export default function gitlab2WecomRobot(message: GitlabPushMessage): WecomRobot {
  return {
    msgtype: 'markdown',
    markdown: {
      content: `
# ${message.project.name}
Message Received.
[detail](${message.repository.git_http_url})<@all>
      `,
    }
  }
}
