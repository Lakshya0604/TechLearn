import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from '@/features/api/courseApi'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

const CLOUD_NAME = "dvpaxrfdi";
const UPLOAD_PRESET = "ml_lectures";

const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

const LectureTab = () => {
    const [lectureTitle, setLectureTitle] = useState("");
    const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
    const [isFree, setIsFree] = useState(false);
    const [mediaProgress, setMediaProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [btnDisabled, setBtnDisabled] = useState(true);
    const params = useParams();
    const { courseId, lectureId } = params;

    const { data: lectureData } = useGetLectureByIdQuery(lectureId);
    const lecture = lectureData?.lecture;

    useEffect(() => {
        if (lecture) {
            setLectureTitle(lecture.lectureTitle);
            setIsFree(lecture.isPreviewFree);
            if (lecture.videoUrl) {
                setUploadVideoInfo({
                    videoUrl: lecture.videoUrl,
                    publicId: lecture.publicId
                });
                setBtnDisabled(false);
            }
        }
    }, [lecture]);

    const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
    const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();

    // ✅ Direct chunked upload to Cloudinary — bypasses backend completely
    const fileChangeHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uniqueId = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        setMediaProgress(true);
        setUploadProgress(0);

        try {
            let lastResponse;

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append("file", chunk);
                formData.append("upload_preset", UPLOAD_PRESET);
                formData.append("resource_type", "video");

                lastResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
                    formData,
                    {
                        headers: {
                            "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
                            "X-Unique-Upload-Id": uniqueId,
                        },
                        onUploadProgress: ({ loaded, total }) => {
                            const totalProgress = Math.round(
                                ((i + loaded / total) / totalChunks) * 100
                            );
                            setUploadProgress(totalProgress);
                        },
                    }
                );
            }

            const { secure_url, public_id } = lastResponse.data;
            setUploadVideoInfo({ videoUrl: secure_url, publicId: public_id });
            setBtnDisabled(false);
            toast.success("Video uploaded successfully!");

        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error("Video upload failed.");
        } finally {
            setMediaProgress(false);
        }
    };

    const editLectureHandler = async () => {
        console.log("uploadVideoInfo before save:", uploadVideoInfo);
        await editLecture({
            lectureTitle,
            videoInfo: uploadVideoInfo,
            isPreviewFree: isFree,
            courseId,
            lectureId
        });
    };

    const removeLectureHandler = async () => {
        await removeLecture(lectureId);
    };

    useEffect(() => {
        if (isSuccess) toast.success(data.message);
        if (error) toast.error(error.data.message);
    }, [isSuccess, error]);

    useEffect(() => {
        if (removeSuccess) toast.success(removeData.message);
    }, [removeSuccess]);

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div>
                    <CardTitle>Edit Lecture</CardTitle>
                    <CardDescription>Make Changes and click save when done.</CardDescription>
                </div>
                <div>
                    <Button disabled={removeLoading} onClick={removeLectureHandler} variant='destructive'>
                        {removeLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </>
                        ) : "Remove Lecture"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <Label>Title</Label>
                    <Input
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        type="text"
                        placeholder="Ex. Introduction to JavaScript"
                    />
                </div>
                <div className='my-5'>
                    <Label>Video <span className='text-red-500'>*</span></Label>
                    <Input
                        type="file"
                        accept='video/*'
                        onChange={fileChangeHandler}
                        disabled={mediaProgress}
                        className='w-fit'
                    />
                    {uploadVideoInfo?.videoUrl && !mediaProgress && (
                        <p className='text-sm text-green-600 mt-1'>
                            ✅ Video ready: {uploadVideoInfo.videoUrl.split('/').pop()}
                        </p>
                    )}
                </div>
                <div className='flex items-center space-x-2 my-2'>
                    <Switch checked={isFree} onCheckedChange={setIsFree} id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Is this Video free</Label>
                </div>
                {mediaProgress && (
                    <div className='my-4'>
                        <Progress value={uploadProgress} />
                        <p className='text-sm text-muted-foreground mt-1'>
                            Uploading... {uploadProgress}%
                            {uploadProgress < 100
                                ? " (Please don't close this page)"
                                : " Processing..."}
                        </p>
                    </div>
                )}
                <div className='mt-4'>
                    <Button
                        disabled={isLoading || mediaProgress || btnDisabled}
                        onClick={editLectureHandler}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </>
                        ) : "Save Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LectureTab;