import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from 'react-share'

function SocialShare({ url, title, description, image }) {
  const shareUrl = url || window.location.href
  const shareTitle = title || 'Check this out!'
  const shareDescription = description || ''

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
      <div className="flex items-center gap-2">
        <FacebookShareButton
          url={shareUrl}
          quote={shareDescription}
          hashtag="#Fincy"
          className="transition-transform hover:scale-110"
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        
        <TwitterShareButton
          url={shareUrl}
          title={shareTitle}
          hashtags={['Fincy', 'Learning']}
          className="transition-transform hover:scale-110"
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        
        <LinkedinShareButton
          url={shareUrl}
          title={shareTitle}
          summary={shareDescription}
          className="transition-transform hover:scale-110"
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        
        <WhatsappShareButton
          url={shareUrl}
          title={shareTitle}
          separator=" - "
          className="transition-transform hover:scale-110"
        >
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
    </div>
  )
}

export default SocialShare

