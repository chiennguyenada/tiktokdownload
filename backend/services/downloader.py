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
        'socket_timeout': 30,
        'retries': 3,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info_dict)
        return filename
