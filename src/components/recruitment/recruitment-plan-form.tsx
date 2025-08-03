import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateRecruitmentPlanData, RecruitmentPlan } from '@/types/recruitment';
import { useRecruitmentPlans } from '@/hooks/use-recruitment-plans';

interface RecruitmentPlanFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: RecruitmentPlan;
  mode?: 'create' | 'edit';
}

export default function RecruitmentPlanForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  mode = 'create' 
}: RecruitmentPlanFormProps) {
  const { createRecruitmentPlan, updateRecruitmentPlan } = useRecruitmentPlans();
  const [skills, setSkills] = useState<string[]>(initialData?.required_skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateRecruitmentPlanData>({
    defaultValues: initialData ? {
      position_title: initialData.position_title,
      department: initialData.department,
      reporting_manager_id: initialData.reporting_manager_id || '',
      estimated_salary: initialData.estimated_salary,
      target_hire_date: initialData.target_hire_date.split('T')[0], // Date input format
      urgency: initialData.urgency,
      reason: initialData.reason,
    } : {
      urgency: 'MEDIUM',
      reason: 'EXPANSION',
    }
  });

  const onSubmit = async (data: CreateRecruitmentPlanData) => {
    try {
      const formData = {
        ...data,
        required_skills: skills,
      };

      if (mode === 'create') {
        await createRecruitmentPlan.mutateAsync(formData);
      } else if (initialData) {
        await updateRecruitmentPlan.mutateAsync({
          id: initialData.id,
          updates: formData,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('採用計画の保存に失敗:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? '新しい採用計画' : '採用計画の編集'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position_title">ポジション名 *</Label>
              <Input
                id="position_title"
                {...register('position_title', { required: 'ポジション名は必須です' })}
                placeholder="例: シニアエンジニア"
              />
              {errors.position_title && (
                <p className="text-sm text-red-500">{errors.position_title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">部署 *</Label>
              <Input
                id="department"
                {...register('department', { required: '部署は必須です' })}
                placeholder="例: Engineering"
              />
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>
          </div>

          {/* 報酬と採用予定日 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_salary">想定年収（万円） *</Label>
              <Input
                id="estimated_salary"
                type="number"
                {...register('estimated_salary', { 
                  required: '想定年収は必須です',
                  min: { value: 0, message: '0以上の値を入力してください' }
                })}
                placeholder="例: 600"
              />
              {errors.estimated_salary && (
                <p className="text-sm text-red-500">{errors.estimated_salary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_hire_date">採用予定日 *</Label>
              <Input
                id="target_hire_date"
                type="date"
                {...register('target_hire_date', { required: '採用予定日は必須です' })}
              />
              {errors.target_hire_date && (
                <p className="text-sm text-red-500">{errors.target_hire_date.message}</p>
              )}
            </div>
          </div>

          {/* 緊急度と理由 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>緊急度</Label>
              <Select 
                value={watch('urgency')} 
                onValueChange={(value) => setValue('urgency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="緊急度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">低</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="CRITICAL">緊急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>採用理由</Label>
              <Select 
                value={watch('reason')} 
                onValueChange={(value) => setValue('reason', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="採用理由を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPANSION">事業拡大</SelectItem>
                  <SelectItem value="REPLACEMENT">欠員補充</SelectItem>
                  <SelectItem value="NEW_INITIATIVE">新規事業</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 必要スキル */}
          <div className="space-y-2">
            <Label>必要スキル</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="スキルを入力"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                追加
              </Button>
            </div>
            
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : mode === 'create' ? '作成' : '更新'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}