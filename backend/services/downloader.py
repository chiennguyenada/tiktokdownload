import yt_dlp
import os
import uuid

def download_video(url: str, output_dir: str = "temp") -> str:
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    unique_filename = str(uuid.uuid4())
    ydl_opts = {
        'outtmpl': f'{output_dir}/{unique_filename}.%(ext)s',
        'format': 'best[ext=mp4]/best',
        'noplaylist': True,
        'socket_timeout': 60,
        'retries': 15,
        'fragment_retries': 15,
        # Experimental impersonation removed due to dependency sync issue
        # 'impersonate': 'chrome-110', 
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'http_headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
            'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
        },
        'extractor_args': {
            'tiktok': {
                'web_domain': 'tiktok.com',
            }
        },
        'quiet': False,
        'no_warnings': False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info_dict)
        return filename
